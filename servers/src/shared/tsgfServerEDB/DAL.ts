
import { BaseMySqlDAL } from "../tsgfServer/BaseDAL";
import { IApp } from "./Models";

export class AppDAL extends BaseMySqlDAL<IApp>{
    constructor(){
        super(getAppDbHelper, 'app', 'appId');
    }
}