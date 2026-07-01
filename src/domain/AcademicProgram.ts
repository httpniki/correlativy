import type { Module, PeriodData, Program } from "../types/types"
import { AcademicModule } from "./AcademicModule"
import AcademicPeriod from "./AcademicPeriod"

export default class AcademicProgram {
   private _plan: number
   private _name: string
   private _periods: AcademicPeriod[]

   constructor(plan: number, name: string, periods: AcademicPeriod[]) {
      this._plan = plan
      this._name = name
      this._periods = periods
   }

   public get periods() { return this._periods }
   public get name() { return this._name }
   public get plan() { return this._plan }

   public canEnroll(id: string): boolean
   public canEnroll(target: AcademicModule): boolean
   public canEnroll(target: AcademicModule | string): boolean {
      let mod: AcademicModule | undefined
      let periodIndex = 0

      if (typeof target === 'string') {
         this.periods.forEach((p, i) => {
            mod = p.modules.find(m => (m.id === target))
            if (mod) periodIndex = i
         })
      }

      if (typeof target === 'object') {
         mod = target
         periodIndex = this.periods.findIndex(p => p.modules.includes(target))
      }

      const reqPassedModules: AcademicModule[] = []
      const reqTakenModules: AcademicModule[] = []

      if (!mod) throw new Error(`Module not found`)

      for (let i = 0; i < periodIndex; i++) {
         this.periods[i].modules.forEach(m => {
            if (mod?.requirements.passed.includes(m.id)) reqPassedModules.push(m)
            if (mod?.requirements.taken.includes(m.id)) reqTakenModules.push(m)
         })
      }

      return reqPassedModules.every(el => el.status === 'Aprobado') && reqTakenModules.every(el => el.status === 'Regular' || el.status === 'Aprobado')
   }

   /**
   * Updates the status of the target module
   */
   public processModule(target: AcademicModule): boolean
   public processModule(id: string): boolean
   public processModule(target: string | AcademicModule): boolean {
      let targetModule: AcademicModule | undefined

      if (typeof target === 'string') {
         this.periods.forEach((p) => targetModule = p.modules.find(m => (m.id === target)))
      }

      if (typeof target === 'object') targetModule = target
      if (!targetModule) throw new Error(`Module ${target} not found`)

      const canEnroll = this.canEnroll(targetModule)

      if (!canEnroll) {
         targetModule.canEnroll = false
         return false
      }

      if (canEnroll) targetModule.canEnroll = true
      targetModule.changeStatus()


      const processNextPeriod = (source: AcademicModule, year: number) => {
         const period = this.periods.find(p => p.year === year)
         if (!period) return

         period.modules.forEach(nmod => {
            if (!nmod.requirements.taken.includes(source.id) && !nmod.requirements.passed.includes(source.id)) return

            const canEnroll = this.canEnroll(nmod)

            nmod.canEnroll = canEnroll
            nmod.status = canEnroll ? nmod.status : 'Pendiente'
            processNextPeriod(source, year + 1)
         })
      }

      processNextPeriod(targetModule, targetModule.year + 1)
      return true
   }

   public static toJSON(Program: AcademicProgram): Program {
      const periods: PeriodData[] = []

      Program.periods.forEach(p => {
         const modules: Module[] = []

         p.modules.forEach(m => {
            modules.push({
               id: m.id,
               name: m.name,
               status: m.status,
               requirements: {
                  passed: m.requirements.passed,
                  taken: m.requirements.taken
               },
               year: m.year
            })
         })
         periods.push({
            year: p.year,
            modules: modules
         })
      })

      return {
         plan: Program.plan,
         name: Program.name,
         periods: periods
      }
   }

   public static fromJSON(Program: Program): AcademicProgram {
      const periods: AcademicPeriod[] = []

      Program.periods.forEach(p => {
         const modules: AcademicModule[] = []

         p.modules.forEach(m => {
            modules.push(new AcademicModule(m.id, m.name, m.status, m.requirements, m.year))
         })

         periods.push(new AcademicPeriod(p.year, modules))
      })

      const academicProgram = new AcademicProgram(Program.plan, Program.name, periods)
      academicProgram.periods.forEach(p => p.modules.forEach(m => m.canEnroll = academicProgram.canEnroll(m)))

      return academicProgram
   }
}
