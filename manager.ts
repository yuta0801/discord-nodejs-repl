import { Snowflake, Message } from 'discord.js'
import { Repl } from './Repl'

const repls = new Map<Snowflake, Repl>()

export const handler = async (message: Message) => {
  if (message.author.bot) return
  if (message.channel.type !== 'text') return
  if (!message.channel.topic.includes('[nodejs-repl]')) return

  if (!repls.has(message.channel.id)) {
    const repl = await new Repl().start()
    repl.onData(data => message.channel.send(data, { split: true }))
    repl.onExit(() => repls.delete(message.channel.id))
    repls.set(message.channel.id, repl)
  }

  repls.get(message.channel.id).exec(message.content)
}
