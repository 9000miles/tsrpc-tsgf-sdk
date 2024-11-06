import { HallClient } from "./hallClient/HallClient";

/**
 *游戏管理对象
 */
export class Game {

    /**单例*/
    public static ins: Game;
    /**
     * @internal
     */
    __hallClient!: HallClient;
    /**
     * @internal
     */
    __myPlayerId!: string;
    /**
     * @internal
     */
    __myPlayerToken!: string;

    /**
     * 初始化
     *
     * @param hallServerUrl
     * @param myPlayerId
     * @param myPlayerToken
     */
    public init(hallServerUrl: string, myPlayerId: string, myPlayerToken: string) {
        this.__hallClient = new HallClient(hallServerUrl);
        this.__myPlayerId = myPlayerId;
        this.__myPlayerToken = myPlayerToken;
    }

    public async dispose(): Promise<void> {
        //@ts-ignore
        this.__hallClient = undefined;
    }

}
