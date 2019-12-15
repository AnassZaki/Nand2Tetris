// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// First we declare the variables we're working with
// sum = R2
// i = 0
// first we check if i < R1 
// then we do sum = sum + R0
// if i < R1 is still true repeat code
// if i > R1 then we terminate the loop/code 

@R0 // M = R0 
D=M // D = R0

@R1 // M = R1
D=M // D = R1

@i // M = i
M=0 // i i = 0
@sum // M = sum
M=0 // sum = 0

(LOOP)
    @i // M = i
    D=M // D = i
    @R1 // R1
    D=D-M // D = R1 - i
    @STOP
    D;JEQ // if y - i = 0 or if i > y jump to STOP

    @sum // M = sum
    D=M // D = sum
    @R0 // R0
    D=D+M // D = sum + R0
    @sum // M = sum
    M=D // sum = sum + R0
    @i // M = i
    M=M+1 // i = i + 1
    @LOOP
    0;JMP

(STOP)
    @sum // M = sum
    D=M // D = sum
    @R2 // M = R2
    M=D // R2 = sum

(END)
    @END
    0;JMP