import type { Access, CollectionConfig, FieldAccess } from 'payload'

import type { User } from '../payload-types'

// Who may do what in the admin. Staff are `users`: a role for the content (admin: everything; editor:
// catalog, pages and photos) and two separate rights for orders, so a manager can handle orders without
// touching the catalog. The site itself reads and writes through the Local API, which skips these rules.
type Staff = Pick<User, 'role' | 'viewOrders' | 'receiveOrders'> | null | undefined

export const isAdmin = (user: Staff) => user?.role === 'admin'
const canEditContent = (user: Staff) => isAdmin(user) || user?.role === 'editor'
// "Receive orders" includes viewing them.
const canViewOrders = (user: Staff) =>
  isAdmin(user) || Boolean(user?.viewOrders) || Boolean(user?.receiveOrders)
const canHandleOrders = (user: Staff) => isAdmin(user) || Boolean(user?.receiveOrders)

const admins = ({ req: { user } }: { req: { user: unknown } }) => isAdmin(user as Staff)
export const adminOnly: Access = admins
export const adminOnlyField: FieldAccess = admins
export const contentEditors: Access = ({ req: { user } }) => canEditContent(user as Staff)
// Visitors and staff without a content role see published documents only; drafts and history are for
// those who edit them.
export const publishedOrEditors: Access = ({ req: { user } }) =>
  canEditContent(user as Staff) ? true : { _status: { equals: 'published' } }
export const orderViewers: Access = ({ req: { user } }) => canViewOrders(user as Staff)
export const orderHandlers: Access = ({ req: { user } }) => canHandleOrders(user as Staff)

// An admin sees and edits every account; anyone else only their own.
export const adminOrSelf: Access = ({ req: { user } }) =>
  isAdmin(user as Staff) ? true : user ? { id: { equals: user.id } } : false

// The admin panel is open to staff with any right; an account without one (a future customer) is not.
export const staffOnly: NonNullable<NonNullable<CollectionConfig['access']>['admin']> = ({
  req: { user },
}) => canEditContent(user as Staff) || canViewOrders(user as Staff)
