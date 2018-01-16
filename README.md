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
    - [`log.packageName[get, set]`](#logpackagenameget-set)
    - [`log.packageVersion[get, set]`](#logpackageversionget-set)
  - [Casos especiais](#casos-especiais)
    - [Nome de aplicação não encontrado](#nome-de-aplicação-não-encontrado)

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

### `log.packageName[get, set]`

Busca ou seta o nome do pacote atual

### `log.packageVersion[get, set]`

Busca ou seta a versão do pacote no formato `0.0.0`

## Casos especiais

### Nome de aplicação não encontrado

Usamos um pacote para buscar o `package.json` e pegar o nome e a versão da sua aplicação, mas as vezes isso pode não funcionar, se este for o caso uma mensagem será exibida no console e você poderá setar manualmente através de:

```js
const log = new Logger('token')

log.packageName = 'Meu package'
log.packageVersion = '1.2.3'
```
