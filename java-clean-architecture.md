---
name: java-clean-architecture
description: Guide Java and Spring Boot backend work with Clean Architecture boundaries - domain and use cases free of framework coupling, ports and adapters, DTOs at the right layer, correct JPA mapping and fetch strategies, transaction boundaries, validation, and REST semantics. Use for any Java or Kotlin backend task — creating or changing controllers, services, use cases, entities, repositories, mappers, exception handlers, Spring configuration or tests (it defines the mandatory test model for Java projects); designing an endpoint; debugging N+1 queries or LazyInitializationException; or deciding where a piece of business logic belongs. Trigger it even for small backend edits, since a single rule placed in the wrong layer is what erodes an architecture over time.
---

# Java Clean Architecture

## Responsibility

Keep Java backends maintainable by putting each concern where it belongs and keeping business rules independent of the frameworks that happen to deliver them.

The point of the boundaries is not purity. It is that business rules you can read, test, and change without booting Spring stay cheap to change for years; rules tangled into controllers and entities do not.

## Respect what exists first

Read the existing architecture before restructuring anything. A project with an established structure — even an imperfect one — is better served by consistency than by a textbook layout imposed halfway.

Two useful defaults:

- If the project already has a convention, follow it and mention the divergence from these guidelines rather than silently correcting it.
- If the project has no convention, apply what follows.

Never migrate package structure as a side effect of an unrelated task.

### The layout these projects actually use

The user's Spring Boot projects (PrismaAPI among them) use a layered layout, and every concrete convention further down — `Where types live`, `Controllers and routes`, `The exception package`, the test model — is written for it:

```
config/        Spring configuration and beans
controller/    <Recurso>Controller + <Recurso>Docs, one package per resource
enums/         domain enums
exceptions/    business exceptions, dto/ and handler/GlobalExceptionHandler
model/dto/     request and response DTOs, projections, internal records
model/entity/  JPA entities
model/mapper/  MapStruct mappers
repository/    Spring Data repositories and Specifications
service/       business rules and calculations
```

In that layout the principles of the next sections map directly: the service is the use case and holds the business rules and the transaction boundary, the controller is the presentation adapter, the repository is the persistence adapter, and `model/entity` accepts JPA annotations as a deliberate coupling. Apply the rules about where logic belongs in those terms instead of introducing ports, gateways or a `domain/` package into a project that does not have them.

## Layers

```
domain/          entities, value objects, domain exceptions, business rules
application/     use cases, port interfaces (in), gateway interfaces (out)
infrastructure/  JPA entities, repository implementations, HTTP clients, messaging
presentation/    Spring controllers, request/response DTOs, exception handlers
config/          Spring configuration, beans, security
```

**The dependency rule:** dependencies point inward. `presentation` and `infrastructure` may depend on `application` and `domain`. `domain` depends on nothing in this project.

Concretely, a domain class should not import `org.springframework`, `jakarta.persistence`, or anything HTTP — unless the project has explicitly accepted that coupling, which is a legitimate choice for small services as long as it is deliberate and consistent.

The inversion that makes this work: the use case declares the interface it needs, in `application/gateway/OrderGateway.java`:

```java
public interface OrderGateway {
    Optional<Order> findById(OrderId id);
    Order save(Order order);
}
```

And infrastructure implements it, in `infrastructure/persistence/OrderRepositoryAdapter.java`:

```java
@Component
class OrderRepositoryAdapter implements OrderGateway { ... }
```

## Where logic belongs

Business rules live in the domain or the use case.

Logic does **not** belong in:

- **Controllers** — they translate HTTP to a use case call and back. A controller with an `if` about business state is a rule that no test will find.
- **Repositories** — they fetch and persist.
- **JPA entities** — persistence concerns; putting rules here couples them to the ORM lifecycle.
- **Mappers** — they convert shapes, they do not decide anything.
- **Framework configuration** — configuration is not a place to hide behaviour.

A practical design check: if the rule could not, even in principle, be exercised without an HTTP request or a JPA session, it is probably in the wrong place. This is a question about where the code lives, not about how it is tested — tests always follow the model in the `Testing` section.

## Where types live

Data-carrying types go in the model package, never in a service, controller, or repository package. That covers every record and class whose job is to hold a shape: request and response DTOs, query projections, and the small internal records a service invents to pass a computed value around — a resolved date range, a reconstructed series, an intermediate total.

A `service` package holds services. A `controller` package holds controllers and their documentation interfaces. A `repository` package holds repositories. When a service needs a helper record, create it under the model/DTO tree beside the DTOs of the same domain and import it, rather than declaring it next to the service that happens to be the first caller — the second caller would otherwise have to reach into a service package for a type.

Mirror the DTO tree's own shape when placing it: a projection that feeds one endpoint's DTOs belongs in a subpackage of that endpoint's DTO package, not in a parallel top-level package of its own.

## Transactions

Transaction boundaries belong at the use case, not the controller and not the repository. That is the layer that knows what constitutes one complete unit of work.

- Keep transactions as short as the work allows. Never hold one open across an HTTP call to an external system.
- Use `@Transactional(readOnly = true)` for queries — it lets the persistence provider skip dirty checking.
- Remember Spring's proxy model: a `@Transactional` method called from inside the same class bypasses the proxy and runs without a transaction. This silently does nothing and is a common source of "the rollback didn't happen".

## Persistence

When using JPA:

- Map relationships to reflect the real model, and default `@ManyToOne` and `@OneToOne` to `FetchType.LAZY` — they are `EAGER` by default, which is where most accidental query storms begin.
- Solve N+1 explicitly with a fetch join, `@EntityGraph`, a projection, or a batch size — not by widening fetch types.
- Never switch `LAZY` to `EAGER` to make a `LazyInitializationException` disappear. That exception is telling you the data was accessed outside a valid persistence context; the fix is to fetch what you need inside the transaction, or to map to a DTO before leaving it.
- Paginate anything that can grow. A `findAll` on a table with real data is an outage waiting for the right Tuesday.
- Be deliberate about cascades, especially `REMOVE` and `orphanRemoval` — these delete data.

**N+1 in practice.** The problem — one query for the orders, then one per order for its items:

```java
List<Order> orders = repository.findAll();
orders.forEach(o -> o.getItems().size());
```

The fix — fetch what the use case needs, in one query:

```java
@Query("select distinct o from Order o join fetch o.items where o.status = :status")
List<Order> findByStatusWithItems(@Param("status") OrderStatus status);
```

## Mapping

Use the project's established mapping approach. If MapStruct is already in use, use MapStruct — introducing a second mapping strategy alongside it doubles the places a field can be forgotten.

Keep mapping mechanical. The moment a mapper starts computing a value or deciding something conditionally, that logic belongs in the domain.

## APIs

- **Validate at the boundary.** Structural validation (required, format, range) belongs on the request DTO with Bean Validation. Business validation (does this customer have credit, is this transition allowed) belongs in the domain, because it depends on state the DTO cannot see.
- **Never expose persistence entities directly** when the architecture expects DTOs. Doing so leaks the schema into the contract and makes every column rename a breaking change.
- **Use honest HTTP semantics:** 200 for a successful read, 201 with `Location` for a creation, 204 for a successful no-content operation, 400 for malformed input, 401 versus 403 correctly, 404 for a missing resource, 409 for a conflict, 422 for semantically invalid input, 500 only for genuine faults.
- **Keep error responses consistent.** One shape, produced by a `@RestControllerAdvice`, carrying enough for the caller to act — and never a stack trace.
- Do not leak SQL or internal identifiers in error text.

### Controllers and routes

Name controller methods — and the methods of the `*Docs` interface they implement — after what they do in the domain, in the project's language, never after the HTTP verb. `getCartoes`, `postCartao`, `putCartao` and `deleteCartao` are exactly the names this rule replaces:

- `POST` that creates → `salvar<Recurso>` (`salvarCartao`). A `POST` that appends to an existing resource takes the verb of its action (`registrarPreco`).
- `PUT` → `atualizar<Recurso>` (`atualizarCartao`).
- `DELETE` → `deletar<Recurso>` (`deletarCartao`), the same verb as the service's `deletar`.
- `GET` of a collection → `listar<Recursos>` (`listarCartoes`, `listarDespesasRecorrentes`). `GET` of one item or of a computed summary → `buscar<Recurso>` (`buscarFatura`, `buscarCarteira`, `buscarVisaoGeral`, `buscarResumo`).

Routes are written in the project's language too: nouns, plural for collections, kebab-case, no accents — `/v1/contas`, `/v1/contas/origens`, `/v1/despesas-recorrentes`, `/v1/metas/{id}/precos`, `/v1/orcamentos/visao-geral`. When a frontend consumes the API, a route is contract: change it in the `*Docs` mapping, in the frontend's route file and in the API contract document in the same piece of work.

### The exception package

Errors are handled with one package, laid out the same way in every project:

```
exceptions/
    <Regra>Exception.java          one plain RuntimeException per business failure
    dto/
        ErrorResponseDTO.java
        MethodArgumentNotValidResponseDTO.java
    handler/
        GlobalExceptionHandler.java
```

Each exception is a bare `RuntimeException` subclass named after the business failure in the project's own language (`ConsultaNaoEncontradaException`, `HorarioConsultaIndisponivelException`), carrying only a message constructor. No status codes, no error codes, no fields — the handler decides the HTTP mapping, and one exception type per failure is what lets it.

`ErrorResponseDTO` is the single response shape, close to RFC 7807: `status`, `title`, `instance`, `type` (a `URI`), `detail`, `errors`, `timestamp`. It carries two convenience constructors that take `type` as a `String`, call `URI.create` and stamp `LocalDateTime.now()` — one with `errors`, one without — so no handler builds a URI or a timestamp by hand. Annotate it `@JsonInclude(NON_NULL)` so absent fields do not appear, and `@Schema` every component.

`GlobalExceptionHandler` is a `@RestControllerAdvice` with one `@ExceptionHandler` method per exception type, each following the same shape:

```java
    @ExceptionHandler(HorarioConsultaIndisponivelException.class)
    public ResponseEntity<ErrorResponseDTO> handleHorarioConsultaIndisponivelException(HorarioConsultaIndisponivelException ex, HttpServletRequest pHttpServletRequest) {

        var response = new ErrorResponseDTO(
                HttpStatus.CONFLICT.value(),
                "Horário de Consulta Indisponível!",
                pHttpServletRequest.getRequestURI(),
                "/<AppName>/problems/horario-consulta-indisponivel",
                ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
```

The details that make it that shape: the method is named `handle<ExceptionName>`; the second parameter is always `HttpServletRequest pHttpServletRequest`; a blank line follows the signature; the result is built into a local `var response`; `instance` is always `pHttpServletRequest.getRequestURI()`; `type` is always `/<AppName>/problems/<kebab-slug>`; `title` is a short phrase in the project's language ending in `!`; `detail` is `ex.getMessage()`, or a fixed sentence with `ex.getMessage()` passed as `errors` when the exception's own message is too technical to show. A 400 returns `ResponseEntity.badRequest()`, everything else `ResponseEntity.status(HttpStatus.X)`.

Always cover, beyond the project's own exceptions: `MethodArgumentNotValidException` (mapping field errors to a list of `MethodArgumentNotValidResponseDTO`), `HttpMessageNotReadableException`, `MethodArgumentTypeMismatchException`, `IllegalArgumentException`, `EntityNotFoundException`, `NoResourceFoundException`, `DataIntegrityViolationException`, and a final `Exception` fallback returning 500. Order the methods by status: the 400s, then the 404s, then the 409s, then the 500.

When the project has Spring Security, the same class also implements `AuthenticationEntryPoint` and `AccessDeniedHandler`, writing the identical `ErrorResponseDTO` to the response with an `ObjectMapper` for 401 and 403 — so an unauthenticated call and a failed business rule look the same to the caller.

## Code style

These are not suggestions to weigh against readability arguments. Write the code this way from the start; do not produce a commented draft and clean it up afterwards.

**Write no comments and no Javadoc.** Not on classes, not on methods, not on fields, not on constants, not above a query, and no `/* ---- */` banners separating sections of a class. The code carries its meaning in the names of classes, methods, and variables — if a line seems to need a comment to be understood, rename things or extract a method until it does not. Explanations of *why* a rule exists belong in the answer to the user, in the commit message, or in the project's documentation, never in the source file.

The rule covers every file in the project, not only `.java`, and every comment syntax: `//`, `/* */` and `/** */` in Java, `build.gradle.kts` and `settings.gradle.kts`; `--` and `/* */` in Flyway migrations; `#` in `application.yml`, `.properties`, `Dockerfile`, `docker-compose.yml`, `.gitignore` and `.gitattributes`; `<!-- -->` in `pom.xml`, `log4j2.xml` and any other XML.

A label that only names a group is a comment too. `// Spring Boot` above a block of dependencies and `### IntelliJ IDEA ###` above a block of `.gitignore` entries both go; the blank line between groups is what separates them. Templates such as Spring Initializr ship these labels, so delete them as soon as the file enters the project instead of carrying them forward. When touching a file that still has comments, remove them all and add none — the projects carry no comments at all.

There are three exceptions. `.env` and `.env.example` keep their comments, because there they explain each variable to whoever sets up the environment. An annotation or directive the compiler or a tool reads, such as `@SuppressWarnings` or a `// NOSONAR` pragma the project already uses, is not a comment. And files a tool generates and overwrites — the Gradle wrapper scripts `gradlew` and `gradlew.bat`, or `mvnw` — are left as generated, license header included, since the next `gradle wrapper` rewrites them anyway. Add a real comment only when the user explicitly asks for one, and then only where they asked.

**Order every field list from the shortest line to the longest.** This applies to injected dependencies (`private final`) and to constant blocks (`private static final`) alike — the measure is the visual length of the whole line, not the type name and not alphabetical order:

```java
    private final FaturaService faturaService;
    private final ContaRepository contaRepository;
    private final CategoriaMapper categoriaMapper;
    private final LancamentoMapper lancamentoMapper;
    private final CategoriaRepository categoriaRepository;
    private final LancamentoRepository lancamentoRepository;
    private final InvestimentoRepository investimentoRepository;
```

Any class that injects another follows this. When you add a dependency to an existing class, reorder the whole block rather than appending to the end. The same shortest-to-longest rule governs the other lists these projects keep by hand, such as the dependency lines in `build.gradle.kts` and the tool list in the README.

**Leave no blank line before a closing brace, and no blank line at the end of a file.** A `}` sits on the line immediately after the last statement, field, or method it closes, and the file's final `}` is the last character in the file — no trailing newline after it.

```java
public class RequisicaoInvalidaException extends RuntimeException {

    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
```

The blank line after the class declaration stays; the one before the closing brace does not. The same rule applies to methods, enums, interfaces, and records. In a record whose components are spread over several lines, the blank line before `) {}` is part of the component list and is kept — the rule is about `}` closing a body, not about a record header.

**Write a literal used in one place directly where it is used.** A `private static final` constant holding a literal exists only when the same value is referenced in two or more places in the class. A message thrown once, a label string, a page size, a scale used by a single `setScale` — each goes literal at its point of use:

```java
    private Conta buscar(UUID id) {
        return contaRepository.findById(id)
                .orElseThrow(() -> new ContaNaoEncontradaException("Conta não encontrada!"));
    }
```

Count references in the code, not the flows that reach them: a constant read only inside a `buscar(id)` helper that both `atualizar` and `deletar` call is still used in one place, and belongs inline in `buscar`. Extracting every message to the top of the class for organisation is exactly the habit this rule removes. When you touch a class that already has a single-use literal constant, inline it.

The rule is about literals — messages, other strings, numbers, characters. A value that is an object built by a call may stay a `private static final` even when it is used once, because naming it keeps the call site readable: `Sort.by(Sort.Order.desc("data"), Sort.Order.desc("dataCriacao"))`, a `List.of(...)` fixing the order of enum values, `Collator.getInstance(...)`, `new BigDecimal("0.05")`, an array of month labels.

```java
    private static final Sort MAIS_RECENTES_PRIMEIRO = Sort.by(Sort.Order.desc("data"), Sort.Order.desc("dataCriacao"));
```

**End every error message with `!`.** That covers the text passed to business exceptions, the Bean Validation messages on request DTOs, validator templates, and the fixed `title` and `detail` strings of the exception handler. When an external contract writes a message ending in a period (`Conta não encontrada.`), keep its wording and swap only the final period for `!`; periods between sentences stay as they are.

## Testing

Every Java project is tested with one model, taken from the PrismaAPI suite. Write new tests this way from the start, and where this section differs from the generic `testing` skill (Testcontainers, `@DataJpaTest`, mocks, behaviour-style test names), this section wins. In a project whose existing suite follows a different shape, do not rewrite that suite as a side effect of an unrelated task; mention the divergence and offer the migration.

The model in one sentence: every test is an integration test that boots the full Spring context with `@SpringBootTest`, runs against a real PostgreSQL seeded by a test-only Flyway migration, rolls back at the end through `@Transactional`, and covers every endpoint, every public service method and every custom repository method with one test each.

### Layout

```
src/test/java/<base-package>/
    config/
        AbstractTest.java
        AbstractControllerTest.java
        TestDataBaseConfig.java
    controller/<recurso>/<Recurso>ControllerTest.java
    service/<recurso>/<Nome>ServiceTest.java
    repository/<recurso>/<Recurso>RepositoryTest.java
src/test/resources/
    db/test/V<next>__PopularBanco.sql
    requests/<recurso>/<acao><Recurso>Request.json
```

The test packages mirror the main packages exactly. There is one test class per controller, one per service class (a `service/conta` package with `ContaService` and `EvolucaoContaService` gets `ContaServiceTest` and `EvolucaoContaServiceTest`) and one per repository that declares its own query methods. There is no `src/test/resources/application*.yml`; the `test` profile lives in the main `application.yaml`:

```yaml
spring:
  config:
    activate:
      on-profile: test

  cache:
    type: none

  flyway:
    locations: classpath:db/migration,classpath:db/test
```

The seed file under `db/test` takes the next version after the last production migration, so it runs only in the `test` profile, after the schema exists. It fills the database with realistic, named records (an account called `Carteira`, an investment called `Bitcoin`) that the tests look up by name. When a new feature needs data to exercise, extend this seed file rather than inserting rows inside the test.

### Base classes

Create these three once per project, in `config/`, and never duplicate their annotations in the test classes.

```java
@Transactional
@ActiveProfiles("test")
@Import(value = TestDataBaseConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public abstract class AbstractTest {

    protected <T> T buscar(JpaRepository<T, UUID> repository, Predicate<T> filtro) {
        return repository.findAll()
                .stream()
                .filter(filtro)
                .findFirst()
                .orElseThrow();
    }
}
```

```java
@Transactional
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(value = TestDataBaseConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public abstract class AbstractControllerTest extends AbstractTest {

    @Autowired
    protected MockMvc mockMvc;

    protected void testGet(String url) throws Exception {
        mockMvc.perform(get(url))
                .andExpect(status().isOk());
    }

    protected void testPost(String url, String requestBody) throws Exception {
        mockMvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated());
    }

    protected void testPut(String url, String requestBody) throws Exception {
        mockMvc.perform(put(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    protected void testDelete(String url) throws Exception {
        mockMvc.perform(delete(url))
                .andExpect(status().isNoContent());
    }
}
```

`TestDataBaseConfig` is a `@TestConfiguration` exposing a `DataSource` bean built with `DataSourceBuilder` for `org.postgresql.Driver`. It reads `DATABASE_IP`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER` and `DATABASE_PASSWORD` through `@Value("${VAR:default}")` fields, with defaults pointing at the local database of the project's `docker-compose`, and assembles the URL as `jdbc:postgresql://%s:%s/%s`.

On Spring Boot 4 the test dependencies are `spring-boot-starter-test` plus the per-module test starters the project uses (`spring-boot-starter-webmvc-test`, `spring-boot-starter-data-jpa-test`, `spring-boot-starter-flyway-test`, `spring-boot-starter-validation-test`) and `junit-platform-launcher` as `testRuntimeOnly`. `@AutoConfigureMockMvc` comes from `org.springframework.boot.webmvc.test.autoconfigure`.

### What the model does not use

No mocks: no Mockito, no `@MockitoBean`. No H2, no Testcontainers and no `@DataJpaTest` or `@WebMvcTest` slices: the context is always the full one, against the real PostgreSQL. No `@DisplayName`, `@Nested`, `@ParameterizedTest` or `@Sql`. No hardcoded UUIDs of seeded records. No static imports of assertions: write `Assertions.assertDoesNotThrow`, qualified.

### Test class shape

Every test class is package-private, annotated with `@SpringBootTest` only, and extends `AbstractTest` (service and repository tests) or `AbstractControllerTest` (controller tests). Dependencies come in through `@Autowired` fields, each field separated from the next by a blank line. Test methods are package-private `void` methods annotated with `@Test`; the controller ones declare `throws Exception`.

Name each test after the method it exercises, followed by `Test`:

- Controller: the controller method name — `listarContasTest`, `salvarContaTest`, `buscarEvolucaoTest`, `deletarContaTest`.
- Service: the service method name — `listarTest`, `salvarTest`, `atualizarTest`, `resumirCarteiraTest`.
- Repository: the repository method name, derived queries included — `findBySituacaoTest`, `existsByNomeIgnoreCaseAndInstituicaoIgnoreCaseTest`, `somarSaldoDoTotalTest`.

Every field list in a test class, `@Autowired` repositories and request `String` fields together, follows the shortest-line-to-longest rule from the code style section. The other style rules apply as well: no comments, no blank line before a closing brace, and the file ends at its final `}`.

### Getting IDs

Never hardcode an ID. Look up a seeded record by a readable attribute with the inherited `buscar`:

```java
        var idConta = buscar(contaRepository, conta -> conta.getNome().equals("Carteira")).getId();
```

When a test needs several IDs, declare one `var` per line before the call, then a blank line, then the call. A repository test that only needs some ID to exercise a query passes `UUID.randomUUID()`.

For a delete, use a seeded record that nothing else references. When every seeded record has dependents that would block the deletion, build a fresh entity with setters in the test and save it through the repository first:

```java
    @Test
    void deletarTest() {
        var conta = new Conta();

        conta.setNome("Conta sem histórico");
        conta.setInstituicao("Banco Aurora");
        conta.setTipo(TipoConta.CORRENTE);
        conta.setSaldo(BigDecimal.ZERO);
        conta.setSituacao(Situacao.ATIVO);
        conta.setIncluirNoTotal(true);

        var idConta = contaRepository.save(conta).getId();

        Assertions.assertDoesNotThrow(() -> contaService.deletar(idConta));
    }
```

Dates that feed a query or a request are relative to today (`LocalDate.now().minusMonths(1)`, `YearMonth.now()`), so the tests keep working as the calendar moves. A fixed date is fine only where the value is part of a request payload that does not depend on the current period.

### Controller tests

One test per endpoint, calling the helper that matches the verb: `testGet`, `testPost`, `testPut`, `testDelete`. The helpers already assert the success status (200, 201, 200, 204), so the test body is only the ID lookup and the call.

Request bodies live as JSON files in `src/test/resources/requests/<recurso>/`, named after the controller action: `salvarContaRequest.json`, `atualizarContaRequest.json`, `registrarAporteRequest.json`. A value that only exists at runtime (an ID of a seeded record, today's date) is written in the JSON as the string `"%s"` and filled in with `.formatted(...)` in the order it appears in the file:

```json
{
  "valor": 500.00,
  "data": "%s",
  "descricao": "Aporte mensal"
}
```

The JSON is loaded once per field in a `@BeforeEach setUp()`, with this exact shape:

```java
@SpringBootTest
class ContaControllerTest extends AbstractControllerTest {

    private String salvarContaRequest;
    private String atualizarContaRequest;

    @Autowired
    private ContaRepository contaRepository;

    @BeforeEach
    void setUp() throws IOException {
        if (salvarContaRequest == null) {
            salvarContaRequest = new String(Files.readAllBytes(Paths.get("src/test/resources/requests/conta/salvarContaRequest.json")));
        }

        if (atualizarContaRequest == null) {
            atualizarContaRequest = new String(Files.readAllBytes(Paths.get("src/test/resources/requests/conta/atualizarContaRequest.json")));
        }
    }

    @Test
    void listarContasTest() throws Exception {
        testGet("/v1/contas");
    }

    @Test
    void salvarContaTest() throws Exception {
        testPost("/v1/contas", salvarContaRequest);
    }

    @Test
    void atualizarContaTest() throws Exception {
        var idConta = buscar(contaRepository, conta -> conta.getNome().equals("Carteira")).getId();

        testPut("/v1/contas/" + idConta, atualizarContaRequest);
    }
}
```

A controller whose endpoints take no body has no request fields and no `setUp`.

### Service tests

One test per public service method. The test builds the input DTO inline, one constructor argument per line, calls the method inside `Assertions.assertDoesNotThrow` and, when the method returns something, asserts it is not null:

```java
    @Test
    void salvarTest() {
        var salvarContaDTO = new SalvarContaDTO(
                "Conta investimento",
                "Banco Horizonte",
                TipoConta.CORRENTE,
                new BigDecimal("1500.00"),
                Situacao.ATIVO,
                true);

        var conta = Assertions.assertDoesNotThrow(() -> contaService.salvar(salvarContaDTO));
        Assertions.assertNotNull(conta);
    }
```

The result variable is named after what it holds (`conta`, `contas`, `carteira`, `extrato`), and the `assertNotNull` sits on the line right after the call, with no blank line between them. A `void` method gets only `Assertions.assertDoesNotThrow(() -> ...)`.

### Repository tests

One test per method the repository declares itself, derived queries, `@Query` methods and `Specification`-based calls alike. Each test is a single `Assertions.assertDoesNotThrow` around the call, with plausible arguments inline, which proves the query parses, maps and runs against the real schema:

```java
    @Test
    void somarPorTipoTest() {
        Assertions.assertDoesNotThrow(() -> lancamentoRepository.somarPorTipo(TipoLancamento.RECEITA, LocalDate.now().minusMonths(1), LocalDate.now()));
    }
```

### Keeping the suite complete

Tests are part of the change, not a follow-up. In the same piece of work:

- A new endpoint gets its controller test, and its request JSON when it takes a body.
- A new public service method gets its service test.
- A new repository method gets its repository test; a new repository with custom methods gets its test class.
- A new resource gets all three test classes, its request JSON files, and the seed rows its tests look up.
- A renamed or removed method renames or removes its test.

Run `./gradlew test` with the project's PostgreSQL running (usually its `docker-compose-postgres.yml`). If the database cannot be brought up, say the tests were not run instead of reporting them as passing.

## Review checklist

- [ ] Domain has no framework imports it should not have
- [ ] Business rules are in the domain or use case, not the controller, repository, or entity
- [ ] Transaction boundary is at the use case, and no external call happens inside it
- [ ] Relationships have deliberate fetch strategies; no accidental N+1
- [ ] Collection endpoints are paginated
- [ ] No entity is exposed directly in an API response
- [ ] Input is validated at the correct boundary
- [ ] Status codes and error shape match the project's convention
- [ ] Controller and `*Docs` methods are named after the action (`salvarX`, `atualizarX`, `deletarX`, `listarX`, `buscarX`), not the HTTP verb, and routes are in the project's language
- [ ] The existing mapping approach was used
- [ ] Package structure was not restructured as a side effect
- [ ] Errors go through the `exceptions` package: one `RuntimeException` per failure, one `ErrorResponseDTO` shape, one `GlobalExceptionHandler` method per type
- [ ] No record or DTO was declared in a service, controller, or repository package
- [ ] Field lists are ordered from the shortest line to the longest
- [ ] No comments and no Javadoc in any file touched — Java, Gradle, SQL, YAML, XML, `.gitignore` — including group labels such as `// Spring Boot`
- [ ] No blank line before any closing brace, and the file ends at its final `}`
- [ ] No `private static final` literal (message, string, number) is referenced in only one place; built objects such as `Sort.by(...)` may stay constants
- [ ] Every error message ends with `!`
- [ ] Every new or changed endpoint, public service method and repository method has its `<metodo>Test`, following the test model: `@SpringBootTest`, extends `AbstractTest` or `AbstractControllerTest`, real PostgreSQL with the test seed, IDs through `buscar`, no mocks
- [ ] `./gradlew test` was run against the database, or the answer says plainly that it was not
