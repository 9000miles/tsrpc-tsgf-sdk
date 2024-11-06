import { ServiceProto } from 'tsrpc-proto';
import { ReqPlayerAuth, ResPlayerAuth } from './PtlPlayerAuth';

export interface ServiceType {
    api: {
        "PlayerAuth": {
            req: ReqPlayerAuth,
            res: ResPlayerAuth
        }
    },
    msg: {

    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 1,
    "services": [
        {
            "id": 0,
            "name": "PlayerAuth",
            "type": "api"
        }
    ],
    "types": {
        "PtlPlayerAuth/ReqPlayerAuth": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "openId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlPlayerAuth/ResPlayerAuth": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        }
    }
};