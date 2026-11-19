import argparse
import re
import unicodedata

from comum import RAIZ_YOUTUBE, SUBPASTAS, agora_iso


def sem_acento(texto):
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()
    texto = re.sub(r'[<>:"/\\|?*]', '', texto)
    return re.sub(r'\s+', ' ', texto).strip()


def proximo_numero():
    numeros = [int(m.group(1)) for p in RAIZ_YOUTUBE.glob('Lote *') if (m := re.match(r'Lote (\d{2}) - ', p.name))]
    return max(numeros, default=0) + 1


def main():
    parser = argparse.ArgumentParser(description='Cria a pasta de um lote novo de cortes com a estrutura padrão.')
    parser.add_argument('canal', help='Canal da fonte (ou "A definir" antes do ✋1)')
    parser.add_argument('tema', help='Tema do lote')
    args = parser.parse_args()

    numero = proximo_numero()
    pasta = RAIZ_YOUTUBE / f'Lote {numero:02d} - {sem_acento(args.canal)} - {sem_acento(args.tema)}'
    pasta.mkdir(parents=True)
    for sub in SUBPASTAS:
        (pasta / sub).mkdir()
    (pasta / 'lote.md').write_text(
        f'# Lote {numero:02d} - {args.canal} - {args.tema}\n\n'
        f'- Criado em: {agora_iso()[:10]}\n'
        '- Etapa atual: ✋1 Fonte\n\n'
        '## Fonte\n\n(preenchida pelo Caçador depois do ✋1)\n\n'
        '## Permissão\n\n(link da regra do canal, licença ou autorização)\n\n'
        '## Decisões\n\n'
        '## Dúvidas\n\n'
        '## Tokens por etapa\n\n',
        encoding='utf-8',
    )
    print(pasta)


if __name__ == '__main__':
    main()
