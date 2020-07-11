import { Snowflake, Message } from 'discord.js'
import { Repl } from './Repl'

const repls = new Map<Snowflake, Repl>()

export const handler = async (message: Message) => {
  if (message.author.bot) return
  if (message.channel.type !== 'text') return
  if (!message.channel.topic?.includes('[nodejs-repl]')) return
  if (message.content.startsWith('//')) return

  const id = message.channel.id

  if (!repls.has(id)) {
    const repl = await new Repl(id).start()
    repl.onData(data => message.channel.send(data, { split: true }))
    repl.onExit(() => repls.delete(id))
    repls.set(id, repl)
  }

  repls.get(id)?.exec(message.content)
}
