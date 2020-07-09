import { promisify } from 'util'
import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { once } from 'events'

export class Repl {
  box = '0' // String(Date.now() % 1000)
  node: ChildProcessWithoutNullStreams

  async start() {
    await exec('isolate', ['-b', this.box, '--cleanup'])
    await exec('isolate', ['-b', this.box, '--init'])

    const options = [
      '--dir=dev=', '--dir=proc=', '--dir=tmp=',
      // '-m 262144', '-f 16384',
      '-b', this.box, '-p',
      '--env=NODE_REPL_HISTORY=" "'
    ].join(' ')
    const isolate = command => `isolate ${options} --run -- ${command}`
    const command = 'cat | ' + isolate('/usr/local/bin/node -i')
    console.log('command:', command)
    this.node = spawn(command, { shell: true })
    this.node.stdout.setEncoding('utf8')
    this.node.stderr.setEncoding('utf8')
    this.node.stdout.on('data', data => console.log('output:', data))
    this.node.stderr.on('data', data => console.log('error:', data))
    return this
  }

  async stop() {
    this.node.kill()
    await exec('isolate', ['-b', this.box, '--cleanup'])
  }

  exec(code: string) {
    console.log('input:', code)
    this.node.stdin.write(code + '\n')
  }

  onExit(callback: () => void) {
    once(this.node, 'close').then(callback)
  }

  onData(callback: (data: string) => void) {
    this.node.stdout.on('data', callback)
  }
}

const exec = async (file: string, args: string[]) => {
  console.log('exec:', file, args)
  const result = await promisify(execFile)(file, args)
  return [result.stdout, result.stderr].map(e => e.trim())
}
