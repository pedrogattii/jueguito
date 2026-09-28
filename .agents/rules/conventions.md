# Reglas del Proyecto: Jueguito (Brainrot WorldBox)

## Commits
- **Conventional Commits**: Todos los mensajes de commit deben seguir el estándar de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Ejemplos: `feat: agrega personaje Skibidi`, `fix: corrige colision de GigaChad`.
- **Commits Atómicos**: Cada commit debe contener un solo cambio lógico e independiente. No mezclar refactorizaciones con nuevas funcionalidades en un mismo commit.

## Documentación
- **Mantener actualizado el README**: Cada nueva mecánica o personaje importante debe quedar documentado en el `README.md`.
- **Código comentado**: Explicar la lógica compleja dentro de `main.ts` o los archivos correspondientes, especialmente la física del canvas o las mecánicas de interacción.

## Estilo de Código
- Usar TypeScript con tipado estricto.
- Mantener una estructura modular a medida que el juego crezca (separar lógica de NPCs, rendering y UI en distintos archivos).
