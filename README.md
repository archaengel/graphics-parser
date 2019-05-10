# Graphic Mini-language Parser

This is a command-line interface which uses monadic parsing to produce commands for a drawing-system from opcode strings.

## Integers

Integers are encoded like so

## Commands

### Clear

Command | Opcode | Parameters | Output
--- | --- | --- | --- 
`CLR` | `F0` | none | `CLR; \n`

This command resets pen position and color.

### Pen Up/Pen Down

Command | Opcode | Parameters | Output
--- | --- | --- | --- 
`PEN` | `80` | 0 = pen up, any other integer value = pen down | `PEN UP; \n` or `PEN DOWN; \n`
