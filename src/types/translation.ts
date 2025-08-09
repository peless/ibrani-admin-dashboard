export default interface Translation {
  t: (key: string, variables?: { [key: string]: string }) => string;
}
