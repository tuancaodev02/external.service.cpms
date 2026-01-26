import { IsNotEmpty, IsString } from 'class-validator';

export class ScriptExecuteFilterModel {
    @IsString()
    @IsNotEmpty()
    script: string;

    constructor(payload: Partial<ScriptExecuteFilterModel>) {
        this.script = payload.script!;
    }
}
