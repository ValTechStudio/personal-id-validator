import { dni } from './dni'
import { passport } from './passport'
import { residence } from './residence'
import { rtn } from './rtn'

export { dni, parse as parseDni, type DniParts } from './dni'
export { rtn, parse as parseRtn, type RtnParts } from './rtn'
export { passport } from './passport'
export { residence } from './residence'
export { departments, type Territory } from './municipalities'

export const documentTypes = [dni, rtn, passport, residence]
