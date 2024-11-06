import { v4 } from "uuid";
import { CryptoHelper } from "./CryptoHelper";

export function buildGuid(type?: string) {
    return (type ?? '') + v4();
}

export function buildPlayerId(appId: string, openId: string) {
    return CryptoHelper.md5(appId + openId + 'FGWOIEURT2038451P34OIWRJD0');
}
export function buildPlayerRobotId(playerId: string) {
    return CryptoHelper.md5(playerId + v4());
}