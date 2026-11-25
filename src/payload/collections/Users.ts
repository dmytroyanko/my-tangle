import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'

import { adminOnly, adminOnlyField, adminOrSelf, staffOnly } from '../access'

// Shop staff with access to the admin. Rights are set by an admin; the first account created becomes one.
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Користувач', plural: 'Користувачі' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'viewOrders', 'receiveOrders'],
  },
  auth: true,
  access: {
    admin: staffOnly,
    create: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // Only the first sign-up comes without a logged-in user (other accounts are created by an admin).
        if (operation === 'create' && !req.user) {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          return totalDocs === 0 ? { ...data, role: 'admin' } : data
        }
        if (
          operation === 'update' &&
          originalDoc?.role === 'admin' &&
          'role' in data &&
          data.role !== 'admin'
        )
          await keepAnAdmin(req, originalDoc.id)
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({ collection: 'users', id, depth: 0, req })
        if (user.role === 'admin') await keepAnAdmin(req, user.id)
      },
    ],
  },
  fields: [
    { name: 'name', label: "Ім'я", type: 'text' },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      options: [
        { label: 'Адміністратор (усе, зокрема користувачі й налаштування)', value: 'admin' },
        { label: 'Редактор контенту (товари, категорії, сторінки, фото)', value: 'editor' },
      ],
      access: { create: adminOnlyField, update: adminOnlyField },
      admin: { description: 'Порожньо – без доступу до контенту (наприклад, лише замовлення)' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'viewOrders',
          label: 'Переглядати замовлення',
          type: 'checkbox',
          defaultValue: false,
          access: { create: adminOnlyField, update: adminOnlyField },
        },
        {
          name: 'receiveOrders',
          label: 'Приймати замовлення',
          type: 'checkbox',
          defaultValue: false,
          access: { create: adminOnlyField, update: adminOnlyField },
          admin: {
            description: 'Отримує лист про кожне нове замовлення і може змінювати його статус',
          },
        },
      ],
    },
  ],
}

// The shop always keeps an admin: without one nobody can manage accounts or Shop settings.
async function keepAnAdmin(req: PayloadRequest, leavingId: number) {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: { role: { equals: 'admin' }, id: { not_equals: leavingId } },
    req,
  })
  if (!totalDocs)
    throw new APIError(
      'Це єдиний адміністратор: спершу призначте адміністратором іншого користувача',
      400,
      null,
      true,
    )
}
