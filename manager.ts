import { Snowflake, Message } from 'discord.js'
import { Repl } from './Repl'

const repls = new Map<Snowflake, Repl>()

export const handler = async (message: Message) => {
  if (message.author.bot) return
  if (message.channel.type !== 'text') return
  if (!message.channel.topic?.includes('[nodejs-repl]')) return

  const id = message.channel.id

  if (!repls.has(id)) {
    const repl = await new Repl(id).start()
    repl.onData(data => message.channel.send(data, { split: { char: '' } }))
    repl.onExit(() => repls.delete(id))
    repls.set(id, repl)
  }

  if (message.content === '.upload') {
    try {
      if (message.attachments.size !== 1)
        throw 'message doesn\'t has one attachment'
      const url = message.attachments.first()?.url
      if (!url) throw 'file not found'
      await repls.get(id)?.upload(url)
      message.channel.send('uploaded file')
    } catch (error) {
      const reason = typeof error === 'string' ? error : 'unknown error'
      message.channel.send('Failed to upload: ' + reason)
      if (typeof error !== 'string') console.log(error)
    }
  } else {
    repls.get(id)?.exec(message.content)
  }
}
