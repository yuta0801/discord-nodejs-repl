import { Client } from 'discord.js'
import { handler } from './manager'
const client = new Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('message', message => {
  handler(message).catch(error => {
    console.log(`unexpected error: ${error.message}`)
  })
})

client.login()
