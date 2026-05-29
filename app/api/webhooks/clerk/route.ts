import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import {
  createOrUpdateUser,
  deleteUser,
  type ClerkWebhookUserData,
  type ClerkWebhookDeleteData,
} from '@/server/actions/user.actions'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    switch(evt.type) {
        case 'user.created':
            await createOrUpdateUser(evt.data as ClerkWebhookUserData)
            break
        case 'user.deleted':
            await deleteUser(evt.data as ClerkWebhookDeleteData)
            break

    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}