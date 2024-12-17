export default interface Player {
    fideid: number;
    name?: string;
    country?: string;
    sex?: string;
    title?: string;
    w_title?: string;
    o_title?: string;
    foa_title?: string;
    rating?: number;
    games?: number;
    k?: number;
    rapid_rating?: number;
    rapid_games?: number;
    rapid_k?: number;
    blitz_rating?: number;
    blitz_games?: number;
    blitz_k?: number;
    birthday?: number;
    flag?: string;
}

export default interface fuseResult {
    item: Player;
    refIndex: string

}
