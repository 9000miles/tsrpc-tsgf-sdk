import { Game } from "./Game";
import { GroupRoom } from "./GroupRoom";
import { Room } from "./Room";
import { initSDKProvider, ISDKProvider } from "./tsgf/Provider";


/**
 * Inits sdk
 * @param provider 由 import \{ buildSDKProvider \} from "tsgf-sdk-*" 提供, 如: tsgf-sdk-browser, tsgf-sdk-miniapp
 */
export function initSDK(provider: ISDKProvider) {
    Game.ins = new Game();
    Room.ins = new Room(Game.ins);
    GroupRoom.ins = new GroupRoom(Game.ins, Room.ins);

    initSDKProvider(provider);
}