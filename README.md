# SQ-Logger

> Wrap do LogEntries para utilização em APIs Squid

<!-- TOC -->

- [SQ-Logger](#sq-logger)
  - [Instalação](#instalação)
  - [Uso](#uso)
    - [`log.info(message: any!)`](#loginfomessage-any)
    - [`log.warning(message: any!)`](#logwarningmessage-any)
    - [`log.error(message: any!)`](#logerrormessage-any)
    - [`log.log(level: string!, message: any!)`](#logloglevel-string-message-any)

<!-- /TOC -->

## Instalação

> Em definição se vamos publicar no NPM ou não

## Uso

Após a instalação use `require` para trazer o pacote:

```js
const Logger = require('sq-logger').Logger
```

> Estamos utilizando `.Logger` porque temos outros dois métodos mais antigos que serão removidos depois (`sqReply` e `sqReplyError`)

Crie uma nova instancia da classe:

```js
const Logger = require('sq-logger').Logger
const log = new Logger('<token do LogEntries>')
```

Isto vai liberar 4 métodos principais e duas propriedades.

### `log.info(message: any!)`

Loga uma mensagem com o nível de informação.

```js
const Logger = require('sq-logger').Logger
const log = new Logger('<token do LogEntries>')

log.info('uma mensagem')
log.info({name: 'Objeto', mensagem: 'A mensagem'})
```

### `log.warning(message: any!)`

Loga uma mensagem com o nível de aviso.

```js
const Logger = require('sq-logger').Logger
const log = new Logger('<token do LogEntries>')

log.warning('uma mensagem')
log.warning({name: 'Objeto', mensagem: 'A mensagem'})
```

### `log.error(message: any!)`

Loga uma mensagem com o nível de erro.

```js
const Logger = require('sq-logger').Logger
const log = new Logger('<token do LogEntries>')

log.error('uma mensagem')
log.error({name: 'Objeto', mensagem: 'A mensagem'})
```

### `log.log(level: string!, message: any!)`

Quando nenhum dos níveis acima for suficiente, expomos um método para utilização de qualquer outro nível que esteja documentado no pacote do Log Entries:

- info
- debug
- warning
- err
- crit
- alert
- notice
- emerg

```js
const Logger = require('sq-logger').Logger
const log = new Logger('<token do LogEntries>')

log.log('notice', 'uma mensagem de notice')
log.log('crit', {name: 'Objeto crítico', mensagem: 'A mensagem'})
```
