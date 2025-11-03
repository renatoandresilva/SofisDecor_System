export interface KeyTest<U, S> {
    prop: S[] | null;
    objKey: string;
    left?: (keyof U)[];
    noVerify: boolean;
}
