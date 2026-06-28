export interface Module {
   id: string
   name: string;
   status: 'Pendiente' | 'Regular' | 'Aprobado' // 'Taken' | 'Passed' | 'Pending'
   requirements: {
      passed: string[]
      taken: string[]
   }
   year: number
}

interface PeriodData {
   year: number
   modules: Module[]
}

export interface Program {
   plan: number;
   name: string;
   periods: PeriodData[]
}

export interface NodeData {
   year: number
   type: 'period' | 'module'
}
