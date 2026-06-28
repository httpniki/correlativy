export class AcademicModule {
   private _id: string
   private _name: string
   private _status: 'Pendiente' | 'Regular' | 'Aprobado'
   private _requirements: {
      passed: string[]
      taken: string[]
   }
   private _year: number
   private _canEnroll: boolean = false

   constructor(
      id: string,
      name: string,
      status: 'Pendiente' | 'Regular' | 'Aprobado',
      requirements: {
         passed: string[]
         taken: string[]
      },
      year: number
   ) {
      this._id = id
      this._name = name
      this._status = status
      this._requirements = requirements
      this._year = year

      if (requirements.passed.length === 0 && requirements.taken.length === 0) this.canEnroll = true
   }

   public get id() { return this._id }
   public get requirements() { return this._requirements }
   public get year() { return this._year }
   public get name() { return this._name }
   public get status() { return this._status }
   public set status(value: 'Pendiente' | 'Regular' | 'Aprobado') { this._status = value }
   public get canEnroll() { return this._canEnroll }
   public set canEnroll(value: boolean) { this._canEnroll = value }

   public changeStatus(): string {
      switch (this._status) {
         case 'Pendiente':
            this._status = 'Regular'
            break
         case 'Regular':
            this._status = 'Aprobado'
            break
         case 'Aprobado':
            this._status = 'Pendiente'
            break
      }

      return this._status
   }
}
