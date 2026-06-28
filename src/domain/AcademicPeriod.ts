import type { AcademicModule } from "./AcademicModule"

export default class AcademicPeriod {
   private _year: number
   private _modules: AcademicModule[]

   constructor(year: number, modules: AcademicModule[]) {
      this._year = year
      this._modules = modules
   }

   public get modules() { return this._modules }
   public get year() { return this._year }
}
