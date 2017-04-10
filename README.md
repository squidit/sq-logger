## sq-logger
> Wrap de logger da Squid

## Usando
Ao realizar o require ou obtendo o `logger` interno, é retornado a instância do logger ([winston](https://github.com/winstonjs/winston)) para relização de logs, podendo-se utilizar os métodos do mesmo.

```js
const logger = require('sq-logger')
logger.log('info', 'meu log marotão')
```

## Transports
Os [Transports](https://github.com/winstonjs/winston/blob/master/docs/transports.md) são configurados conforme o ambiente atual, verificando através do `NODE_ENV`.

### Produção
Configurado para salvar no [LogEntries](logentries.com/app/) todos os erros e informações.

**Importante**: Configurar variável de ambiente com a chave do logentries no env: `LOGGER_TOKEN`.

### Stage
Ambiente de homologação, configurado para salvar em arquivos separados por diretórios diários com os seguintes arquivos:

- `all-logs.log`: contendo os logs esperados
- `exceptions.log`: contendo todos os logs de erros inesperados

### Development
Ambiente de desenvolimento local, configurado para salvar em arquivos na raiz do projeto com os seguintes arquivos:

- `all-logs.log`: contendo os logs esperados
- `exceptions.log`: contendo todos os logs de erros inesperados

# API

## Register
`logger.register([ErrorClasses])`
`logger.getExpectedErrors() => ['classnames']`

Realiza o registro das classes esperadas de erros. Todos os erros que estiverem no registro serão lançados como *Bad request*, e os demais serão *Internal server error*.

## Reply
`logger.reply(request, reply, statusCode = 200)(data)`

Utilizado para realizar o reply do Hapi e adicionar um log do tipo *info*.

Ex:

```js
const { sqReply } = require('sq-logger')

function myHandler (request, reply) {
  doSomething(request.param.id)
    .then(sqReply(request, reply))
}
```

## ReplyError
`logger.replyError(request, reply)(error)`

Realiza o reply do erro que ocorreu como erro do Boom.

Caso o erro esteja na lista de erros registrados, é retornado um *bad request*, caso contrário, sempre é retornado um 500 e é omitido o erro para o usuário final.

Erros personalizados devem lançar seus erros no Boom conforme a [listagem oficial](https://github.com/hapijs/boom#http-4xx-errors).

```js
const { sqReplyError } = require('sq-logger')

function myHandler (request, reply) {
  doSomething(request.param.id)
    .catch(sqReplyError(request, reply))
}
```

## Configuração
Por padrão o level de log é *error*, caso queira alterar, exporte no ambiente a variável `LOGGER_LEVEL` com o valor desejado.

Valores possíveis:
- error
- warn
- info
- verbose
- debug
- silly

Para que os logs sejam transportados para o LogEntries em produção é necessário ter exportado no ambiente o valor para `LOGGER_TOKEN`. Caso esteja em produção mas não tenha o valor para o token, os transportes de stage são configurados.
