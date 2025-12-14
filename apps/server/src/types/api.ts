export interface API {
  add(a: number, b: number): Promise<number>
  addWithCallback(
    a: number,
    b: number,
    callback: (result: number) => void,
  ): void
  tasks: {
    task1(): Promise<string>
  }
}
