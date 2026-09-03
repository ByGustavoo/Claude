---
name: java-clean-architecture
description: Guide Java and Spring Boot backend work with Clean Architecture boundaries - domain and use cases free of framework coupling, ports and adapters, DTOs at the right layer, correct JPA mapping and fetch strategies, transaction boundaries, validation, and REST semantics. Use for any Java or Kotlin backend task — creating or changing controllers, services, use cases, entities, repositories, mappers, exception handlers or Spring configuration; designing an endpoint; debugging N+1 queries or LazyInitializationException; or deciding where a piece of business logic belongs. Trigger it even for small backend edits, since a single rule placed in the wrong layer is what erodes an architecture over time.
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

The inversion that makes this work: the use case declares the interface it needs, and infrastructure implements it.

```java
// application/gateway/OrderGateway.java
public interface OrderGateway {
    Optional<Order> findById(OrderId id);
    Order save(Order order);
}

// infrastructure/persistence/OrderRepositoryAdapter.java
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

A practical test: if you cannot exercise the rule in a plain JUnit test with no Spring context and no database, it is probably in the wrong place.

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

**N+1 in practice:**

```java
// Problem: one query for orders, then one per order for its items
List<Order> orders = repository.findAll();
orders.forEach(o -> o.getItems().size());

// Fix: fetch what the use case needs, in one query
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
- **Keep error responses consistent.** One shape, produced by a `@RestControllerAdvice`, carrying enough for the caller to act — and never a stack trace or an internal message.
- Do not leak entity names, SQL, or internal identifiers in error text.

## Testing

Read `testing` for strategy. The architectural point:

- Business rules should be testable with plain JUnit — no Spring context, no database. If they are not, the boundary is wrong.
- Persistence behaviour needs its own tests against a real database (`@DataJpaTest` with Testcontainers rather than an in-memory database that behaves differently from production).
- Controller tests verify HTTP semantics, serialization, and validation — not business rules that are already covered underneath.

## Review checklist

- [ ] Domain has no framework imports it should not have
- [ ] Business rules are in the domain or use case, not the controller, repository, or entity
- [ ] Transaction boundary is at the use case, and no external call happens inside it
- [ ] Relationships have deliberate fetch strategies; no accidental N+1
- [ ] Collection endpoints are paginated
- [ ] No entity is exposed directly in an API response
- [ ] Input is validated at the correct boundary
- [ ] Status codes and error shape match the project's convention
- [ ] The existing mapping approach was used
- [ ] Package structure was not restructured as a side effect
