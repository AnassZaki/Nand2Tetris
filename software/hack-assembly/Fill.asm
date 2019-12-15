// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// 1-Listener Loop: get keyboard memory register 
// if kmr == 0 goto white
// if kmr !== 0 goto black
// 2-Filler Loop: for each register of the screen memory map
//                   arr[screen+i] = -1
// repeat black until i > n. where n is the number of screen registers
// if i > n goto white

@8192 // 32 * 256 selecting the whole screen
D=A
@n
M=D // n = 8192

(LOOP) 
    @i
    M=0 // initializing the index i = 0

(MAIN)
    @KBD
    D=M // D = 24576
    @WHITE
    D;JEQ // if key = 0 jump to WHITE
    
(BLACK)
    @i 
    D=M 
    @SCREEN
    A=A+D // A = 16384 + i 
    M=-1 // RAM[16384 + i] = -1 balckens the row
    @END
    0;JMP 

(WHITE)
    @i
    D=M // D = i
    @SCREEN // A = 16384
    A=A+D // A = 16384 + i 
    M=0 // RAM[16384 + i] = 0 whitens the row

(END)
    @i
    M=M+1 // i = i + 1
    @n // n = 8192
    D=D-M // D = 8192 - i
    @LOOP
    D;JEQ // if D = 0 jump to LOOP 
    @MAIN
    0;JMP // if D != 0 jumpt to MAIN