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

When pen is up, no mark is made.

### Color

Command | Opcode | Parameters | Output
--- | --- | --- | --- 
`CO` | `A0` | R, G, B, and Alpha. (0...255) | `CO {R} {G} {B} {A}`

### Move

Command | Opcode | Parameters | Output
--- | --- | --- | --- 
`MV` | `C0` | `x0 y0 [x1 y1 ... xn yn]` | If pen is up, move to final position. Otherwise: `MV (x0, y0) [... (xn, yn)];\n`

While the encoded commands will give coordinates relative to current pen position, output should display absolute coordinates.

If command takes pen outside of (-8192, -8192) ... (8191, 8191) then pen should move until it reaches the boundary, lift, and then lower once it re-enters the canvas.

## Examples

### Blue Square

Input:

```
F0A040004000417F417FC04000400090400047684F5057384000804001C05F204000400001400140400040007E405B2C4000804000
```

![blue sqaure](img/blue-square.png | width=100)

Output:

```
CLR;
CO 0 0 255 255;
MV (0, 0);
PEN DOWN;
MV (4000, 0) (4000, -8000) (-4000, -8000) (-4000, 0) (-500, 0);
PEN UP;
```

