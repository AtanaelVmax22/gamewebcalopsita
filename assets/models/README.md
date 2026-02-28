# Modelo 3D da Calopsita

Para usar um **modelo realista de calopsita com animações**, coloque o arquivo abaixo nesta pasta:

- `cockatiel.glb`

O jogo já está preparado para carregar automaticamente esse modelo primeiro.
Se ele não existir (ou falhar), o sistema usa um modelo de fallback (`Parrot.glb`) para não quebrar o gameplay.

## Requisitos recomendados do arquivo
- Formato: `.glb`
- Malha realista de calopsita (cockatiel)
- Pelo menos 1 animação embutida no arquivo (voo, idle, walk etc.)
- Licença de uso compatível com seu projeto

## Comportamento no jogo
- Humor **Feliz**: animação mais suave e deslocamento moderado
- Humor **Estressada**: animação mais rápida e agitada
- Humor **Triste**: animação lenta e pouca movimentação
- **Carinho**: aplica um wiggle curto no modelo
