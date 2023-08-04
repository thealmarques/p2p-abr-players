export enum PlayerType {
    SHAKA_PLAYER,
    HLS,
}

export interface VideoDetails {
    url: string;
    element: HTMLVideoElement;
    name: string;
}

export interface PlayerConfig {
    type: PlayerType;
    details: VideoDetails;
}
