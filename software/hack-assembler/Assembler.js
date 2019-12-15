/* First we write code that loads the xxxxx.asm file into our Assembler:
1 @0    
2 D=D+1
3 @1
4 D=D+M
5 0;JMP 
--------------Parsing---------------
[@][0]
[D][D+1]
[@][1]
[D][D+M]
[0][JMP]
------------Translating-------------
"@ = 0", "0 = 15-bit binary code"
string out = 0 + 000000000000000;
"D = dest();", "D+1 = comp();", "null = jump();"
111 + a + comp + dest + jump
string out = 111 + 0 + 011111 + 010 + 000;
....
....
....
string out n;
--------Producing xxxxx.ml----------
string out 1
string out 2
string out 3
....
....
....
string out n;
*/

// Reading the files 
// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

/* Reads the file and writes its content in an array.
and Writes the processed array on a file. */
var fs = require('fs'),
  filename = process.argv[2];
fs.readFile(filename, 'utf8', function (err, data) {
  if (err) throw err;
  // Create an array of strings from xxxxx.asm file
  var file_data = data.toString().split("\n");
  var file_strings = [];
  for (i in file_data) {
    // Remove all whitespace and comments
    file_strings.push(file_data[i].replace(/(\s)|(\/\/[^*]*)/g, ''));
  }
  // Create an array of strings with instructions only
  var asm_code = file_strings.filter(el => el.length > 0);

  // Array of Machine Language instructions
  var hack_code = assemble(asm_code)
  // console.log(assemble(mainArr));

  var file = fs.createWriteStream('RectL.hack');
  file.on('error', function (err) {
    console.log(err ? 'Error :' + err : 'ok')
  });
  hack_code.forEach((value) => file.write(`${value}\n`));
  file.end();
});

// Symbols Object (Table)
var symbols = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,
  SCREEN: 16384,
  KBD: 23576,
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  // In the fisrt pass we read the array and add any new label only once to this object
}

// Symbols for computation instructions
var comp = {
  "0": "0101010",
  "1": "0111111",
  "-1": "0111010",
  "D": "0001100",
  "A": "0110000",
  "M": "1110000",
  "!D": "0001101",
  "!A": "0110001",
  "!M": "1110001",
  "-D": "0001111",
  "-A": "0110011",
  "-M": "1110011",
  "D+1": "0011111",
  "A+1": "0110111",
  "M+1": "1110111",
  "D-1": "0001110",
  "A-1": "0110010",
  "M-1": "1110010",
  "D+A": "0000010",
  "D+M": "1000010",
  "D-A": "0010011",
  "D-M": "1010011",
  "A-D": "0000111",
  "M-D": "1000111",
  "D&A": "0000000",
  "D&M": "1000000",
  "D|A": "0010101",
  "D|M": "1010101"
}

// Symbols for destination instructions
var dest = {
  "M": "001",
  "D": "010",
  "MD": "011",
  "A": "100",
  "AM": "101",
  "AD": "110",
  "AMD": "111"
}

// Symbols for jump instructions
var jump = {
  "JGT": "001",
  "JEQ": "010",
  "JGE": "011",
  "JLT": "100",
  "JNE": "101",
  "JLE": "110",
  "JMP": "111"
}

// Converts value to its 32-bit binary number
function createBinaryString(nMask) {
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++ , sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask;
}

// Converts value to its 15-bit binary number
function convertTo15Bit(str) {
  let newstr = "";
  for (let i = (str.length / 2) + 1; i < str.length; i++) {
    newstr += str[i]
  }
  return newstr;
}

// A-instruction handling function
function translateAInstruction(str) {
  let newStr = '0' + convertTo15Bit(createBinaryString(parseInt(str.replace('@', ''))));
  return newStr;
}

// Adds new variables to the symbols table
function getVaiables(lines) {

  let object = getLabels(lines);
  let m = 16;

  lines.filter((line) => line.indexOf('@') === 0)
    .map((line) => line.replace('@', ''))
    .filter(el => el.match(/^[0-9]+$/) == null)
    .filter(el => !object.hasOwnProperty(el))
    .forEach(el => {
      if (!object.hasOwnProperty(el)) {
        object[el] = m++;
      }
    });

  return object;
}

// Adds new labels to the symbols table
function getLabels(lines) {

  let label_offset = 0;
  lines.forEach((line, index) => {
    if (line.indexOf('(') === 0) {
      const label = line.replace(/[()]/g, '');
      symbols[label] = index - label_offset;
      label_offset += 1;
    }
  })

  return symbols;
}

// Replaces label and variable names with their values 
function firstPass(lines) {

  // import symbols table
  let object = getVaiables(lines);

  // Array replacing the variable and labels name with 
  // their appropriate value in the symbols table.
  // example: @i = @16, @LOOP = @10, @END = @60...

  let vars_labels = [];

  lines.forEach((line) => {
    if (line.indexOf('@') == 0 && line.match(/^[@\d]+$/g) == null) {
      line = '@' + object[line.replace('@', '')]
    }
    if (line.indexOf('(') != 0) {
      vars_labels.push(line);
    }
  });

  return vars_labels;
}

// C-instruction handling function
function translateCInstruction(str) {
  let c_inst = [];

  if (str.indexOf('=') != 0 || str.indexOf(';') >= 0) {
    c_inst.push(str.split(/[= ;]/));
  }

  for (let i = 0; i < c_inst.length; i++) {
    if (c_inst[i].length == 1) {
      return "111" + comp[c_inst[i][0]] + "000" + "000" // 0 = comp; 0
    } else if (c_inst[i].length == 2) {
      if (jump.hasOwnProperty(c_inst[i][1])) {
        return "111" + comp[c_inst[i][0]] + "000" + jump[c_inst[i][1]] // 0 = comp; jump
      } else if (dest.hasOwnProperty(c_inst[i][0]) >= 0) {
        return "111" + comp[c_inst[i][1]] + dest[c_inst[i][0]] + "000" // dest = comp; 0
      }
    } else if (c_inst[i].length == 3) {
      return "111" + comp[c_inst[i][1]] + dest[c_inst[i][0]] + jump[c_inst[i][2]] // dest = comp; jump
    }
  }
}

// Main function
// Translates all the instructions in the program
function assemble(instructions) {

  // array without label and variable symbols
  let no_symbols = firstPass(instructions);

  let hack_inst = [];
  for (let i = 0; i < no_symbols.length; i++) {
    if (no_symbols[i].indexOf('@') == 0) {
      hack_inst.push(translateAInstruction(no_symbols[i]));
    } else {
      hack_inst.push(translateCInstruction(no_symbols[i]));
    }
  }

  // array of hack (binary) instructions
  return hack_inst;
}