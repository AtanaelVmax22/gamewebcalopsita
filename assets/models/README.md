# Modelo 3D da Calopsita

Para usar um **modelo realista de calopsita com animações**, coloque o arquivo abaixo nesta pasta:

- `cockatiel.glb`

O jogo já está preparado para carregar automaticamente esse modelo primeiro.
Se ele não existir (ou falhar), o sistema usa um modelo de fallback (`Parrot.glb`) para não quebrar o gameplay.

## Modelo interno (sem download)
Se você não colocar nenhum arquivo `.glb`, o jogo agora usa uma **calopsita 3D procedural** modelada no código (mais próxima da anatomia real), com cabeça, bochechas, crista, asas e cauda animadas por humor.


## Precisa ser grátis? ✅
Sim. Você pode usar fontes **gratuitas** e com licença permissiva.

### Opções grátis para buscar modelo
- Sketchfab (filtre por *Downloadable* e licença gratuita):
  - https://sketchfab.com/search?features=downloadable&type=models&q=cockatiel
- Poly Pizza (modelos low-poly gratuitos):
  - https://poly.pizza/
- Kenney (assets gratuitos de jogos):
  - https://kenney.nl/assets
- Quaternius (pacotes 3D grátis):
  - https://quaternius.com/
- OpenGameArt (conteúdo gratuito com licenças abertas):
  - https://opengameart.org/

> Dica: antes de baixar, confirme se a licença permite uso no seu projeto
> (CC0, CC-BY, royalty-free grátis etc.) e se exige atribuição.

## Requisitos recomendados do arquivo
- Formato: `.glb`
- Malha realista de calopsita (cockatiel)
- Pelo menos 1 animação embutida no arquivo (voo, idle, walk etc.)
- Licença gratuita e compatível com seu projeto

## Comportamento no jogo
- Humor **Feliz**: animação mais suave e deslocamento moderado
- Humor **Estressada**: animação mais rápida e agitada
- Humor **Triste**: animação lenta e pouca movimentação
- **Carinho**: aplica um wiggle curto no modelo
