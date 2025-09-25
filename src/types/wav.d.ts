declare module 'wav' {
  export interface WavFileWriter {
    write(buffer: Buffer): void;
    end(): void;
  }
  
  export interface WavFileReader {
    on(event: string, callback: Function): void;
  }
  
  export class FileWriter {
    constructor(filename: string, options?: any);
    write(buffer: Buffer): void;
    end(): void;
  }
  
  export class FileReader {
    constructor(filename: string);
    on(event: string, callback: Function): void;
  }
  
  export class Writer {
    constructor(options?: any);
    write(buffer: Buffer): void;
    end(): void;
    on(event: string, callback: Function): void;
  }
  
  export class Reader {
    constructor(options?: any);
    on(event: string, callback: Function): void;
  }
  
  const wav: {
    FileWriter: typeof FileWriter;
    FileReader: typeof FileReader;
    Writer: typeof Writer;
    Reader: typeof Reader;
  };
  
  export default wav;
}