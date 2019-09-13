import { CommandHandler, Command } from './Utility/CommandHandler'
import { botConfig, botQuotes, main } from './main'
import { functions } from './functions'
import { bnetControl } from './bnetcontrol'
import _ from 'lodash'
import {
    permissionHandler,
    CommandPermGroup,
    CommandExecutor,
    UserCommandExecutor,
} from './Permissions'

export const commandHandler = new CommandHandler(permissionHandler)

export const registerCommands = () => {
    commandHandler.registerCommand({
        cmd: 'say',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            main.processSendMessage(args.join(' '))
        },
    })

    commandHandler.registerCommand({
        cmd: 'rban',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            let userids = functions.getUserIDsRegex(args[0])
            if (!userids.length) {
                functions.sendNotificationMessage(
                    'error',
                    'If you cant see them you cant ban them. (Battle.Net Classic Chat API Cons).'
                )
                return
            } //non existant/visable user

            userids.forEach(function(userid) {
                bnetControl.sendBanMessage(userid)
            })
        },
    })

    commandHandler.registerCommand({
        cmd: 'ban',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            let userid = functions.getUserID(args[0])
            if (userid == '-1') {
                functions.sendNotificationMessage(
                    'error',
                    'If you cant see them you cant ban them. (Battle.Net Classic Chat API Cons).'
                )
                return
            } //non existant/visable user
            bnetControl.sendBanMessage(userid)
        },
    })

    commandHandler.registerCommand({
        cmd: 'unban',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            bnetControl.sendUnbanMessage(args[0])
        },
    })

    commandHandler.registerCommand({
        cmd: 'kick',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            let userid = functions.getUserID(args[0])
            if (userid == '-1') {
                functions.sendNotificationMessage(
                    'error',
                    'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).'
                )
                return
            } //non existant/visable user
            bnetControl.sendKickMessage(userid)
        },
    })

    commandHandler.registerCommand({
        cmd: 'rkick',
        perm: CommandPermGroup.shaman,
        func: (cmd, args) => {
            let userids = functions.getUserIDsRegex(args[0])
            if (!userids.length) {
                functions.sendNotificationMessage(
                    'error',
                    'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).'
                )
                return
            } //non existant/visable user

            userids.forEach(userid => {
                bnetControl.sendKickMessage(userid)
            })
        },
    })

    commandHandler.registerCommand({
        cmd: 'arkick',
        perm: CommandPermGroup.root,
        func: (cmd, args) => {
            if (!botConfig['arkicklist']) {
                botConfig['arkicklist'] = []
            }

            botConfig['arkicklist'].push(args[0])

            main.saveData()
            main.processSendMessage("Added: '" + args[0] + "' to kicklist.")

            let userids = functions.getUserIDsRegex(args[0])
            if (!userids.length) {
                functions.sendNotificationMessage(
                    'error',
                    'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).'
                )
                return
            } //non existant/visable user

            userids.forEach(function(userid) {
                bnetControl.sendKickMessage(userid)
            })
        },
    })

    if (main.isOptionEnabled('cmd_nab')) {
        commandHandler.registerCommand({
            cmd: 'nab',
            perm: CommandPermGroup.shaman,
            func: (cmd, args) => {
                // prettier-ignore
                {
                 main.   processSendMessage('#####            ###              #####                 ########')
                 main.   processSendMessage('### ###        ###            ###   ###              ###          ##')
                 main.   processSendMessage('###  ###       ###          ###       ###            ###          ##')
                 main.   processSendMessage('###    ###     ###        ###           ###          ########')
                 main.   processSendMessage('###      ###   ###      ############       ###          ##')
                 main.   processSendMessage('###        ### ###    ###                   ###      ###          ##')
                 main.   processSendMessage('###          #####    ###                       ###   ########')
                }

                return
            },
        })
    }

    if (main.isOptionEnabled('cmd_gay')) {
        commandHandler.registerCommand({
            cmd: 'gay',
            perm: CommandPermGroup.shaman,
            func: (cmd, args) => {
                // prettier-ignore
                {
                  main. processSendMessage('      #####                  ###            ##             ##')
                  main. processSendMessage('   ##        ##             ##  ##             ##       ##')
                  main. processSendMessage(' ##                          ##       ##             ## ##')
                  main. processSendMessage('##      ####         ########              ##')
                  main. processSendMessage(' ##          ##       ##              ##             ##')
                  main. processSendMessage('    ######       ##                  ##           ##')
                }

                return
            },
        })
    }

    if (main.isOptionEnabled('cmd_glue')) {
        commandHandler.registerCommand({
            cmd: 'glue',
            perm: CommandPermGroup.shaman,
            func: (cmd, args) => {
                // prettier-ignore
                {
                  main.  processSendMessage('    ##       ##')
                  main.  processSendMessage(' #     #  #     #')
                  main.  processSendMessage('#        #        #')
                  main.  processSendMessage('  #              #')
                  main.  processSendMessage('     #        #')
                  main.  processSendMessage('          #')
                }

                return
            },
        })
    }

    if (main.isOptionEnabled('cmd_apple')) {
        commandHandler.registerCommand({
            cmd: 'apple',
            perm: CommandPermGroup.shaman,
            func: (cmd, args) => {
                // prettier-ignore
                {
                    main.  processSendMessage('/kick Wrda Thanks for the apple!')
                }

                return
            },
        })
    }

    commandHandler.registerCommand({
        cmd: 'qu',
        perm: CommandPermGroup.quotes,
        func: (cmd, args) => {
            if (!botQuotes['quotes']) {
                return
            }

            let quote

            if (args[0]) {
                quote = botQuotes['quotes'][args[0]]
            } else {
                quote = _.sample(
                    botQuotes['quotes'].map((q: any, k: any) => {
                        return { k: k + 1, quote: q.quote }
                    })
                )
            }

            if (quote) {
                main.processSendMessage('/me ' + quote.quote) // + " (" + quote.k + "/" + botQuotes['quotes'].length + ")");
            } else {
                main.processSendMessage('Quote not found.')
            }

            return
        },
    })

    commandHandler.registerCommand({
        cmd: 'qa',
        perm: CommandPermGroup.quotes,
        func: (cmd, args) => {
            const quote = args.join(' ').trim()

            if (quote.length) {
                main.addQuote(quote, cmd)
                main.processSendMessage('/me Quote added.')
            }

            return
        },
    })

    commandHandler.registerCommand({
        cmd: 'ql',
        perm: CommandPermGroup.quotes,
        func: (cmd, args) => {
            main.processSendMessage(
                '/me There are ' + botQuotes['quotes'].length + ' quotes.'
            )
        },
    })

    commandHandler.registerCommand({
        cmd: 'help',
        func: (cmd, args, executor: UserCommandExecutor) => {
            const cmds = commandHandler
                .getCommands()
                .filter(cmd => permissionHandler.hasAccess(executor, cmd))

            if (cmds) {
                main.processSendMessage(
                    '/w ' + executor.username + ' ' + 'Commands:'
                )
                cmds.forEach(cmd => {
                    main.processSendMessage(
                        '/w ' +
                            executor.username +
                            ' ' +
                            main.getConfig()['trigger'] +
                            cmd.cmd
                    )
                })
            } else {
                main.processSendMessage(
                    "You don't have access to any commands."
                )
            }
        },
    })
}
