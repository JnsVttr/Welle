import * as https from 'https';
import * as http from 'http';

/**
 * A TypedMessage consists of an OSC address and an optional array of typed OSC arguments.
 *
 * @typedef {'i'|'f'|'s'|'b'|'h'|'t'|'d'|'T'|'F'|'N'|'I'} MessageArgType
 *
 * - `i` - int32
 * - `f` - float32
 * - `s` - string
 * - `b` - blob
 * - `h` - int64
 * - `t` - uint64
 * - `d` - double
 * - `T` - True (no argument data)
 * - `F` - False (no argument data)
 * - `N` - Nil (no argument data)
 * - `I` - Infinitum (no argument data)
 *
 * @typedef {number|string|Blob|VALUE_TRUE|VALUE_FALSE|VALUE_NONE|VALUE_INFINITY} MessageArgValue
 *
 * @typedef {object} MessageArgObject
 * @property {MessageArgType} type
 * @property {MessageArgValue} value
 *
 * @example
 * const messageArgObject = {
 *   type: 'i', value: 123
 * }
 */
declare class TypedMessage {
    /**
     * Create a TypedMessage instance
     * @param {string[]|string} address Address
     * @param {MessageArgValue[]} args Arguments
     *
     * @example
     * const message = new TypedMessage(['test', 'path'])
     * message.add('d', 123.123456789)
     * message.add('s', 'hello')
     *
     * @example
     * const message = new TypedMessage('/test/path', [
     *   { type: 'i', value: 123 },
     *   { type: 'd', value: 123.123 },
     *   { type: 'h', value: 0xFFFFFFn },
     *   { type: 'T', value: null },
     * ])
     */
    constructor(address: string[] | string, args: MessageArgValue[]);
    /**
     * @type {number} offset
     * @private
     */
    private offset;
    /** @type {string} address */
    address: string;
    /** @type {string} types */
    types: string;
    /** @type {MessageArgValue[]} args */
    args: MessageArgValue[];
    /**
     * Add an OSC Atomic Data Type to the list of elements
     * @param {MessageArgType} type
     * @param {MessageArgValue} item
     */
    add(type: MessageArgType, item: MessageArgValue): void;
    /**
     * Interpret the Message as packed binary data
     * @return {Uint8Array} Packed binary data
     */
    pack(): Uint8Array;
    /**
     * Unpack binary data to read a Message
     * @param {DataView} dataView The DataView holding the binary representation of a Message
     * @param {number} [initialOffset=0] Offset of DataView before unpacking
     * @return {number} Offset after unpacking
     */
    unpack(dataView: DataView, initialOffset?: number): number;
}
/**
 * An OSC message consists of an OSC Address Pattern followed
 * by an OSC Type Tag String followed by zero or more OSC Arguments
 */
declare class Message extends TypedMessage {
    /**
     * Create a Message instance
     * @param {string[]|string} address Address
     * @param {...MessageArgValue} args OSC Atomic Data Types
     *
     * @example
     * const message = new Message(['test', 'path'], 50, 100.52, 'test')
     *
     * @example
     * const message = new Message('/test/path', 51.2)
     */
    constructor(address: string[] | string, ...args: MessageArgValue[]);
    /**
     * Add an OSC Atomic Data Type to the list of elements
     * @param {MessageArgValue} item
     */
    add(item: MessageArgValue): void;
}
/**
 * - `i` - int32
 * - `f` - float32
 * - `s` - string
 * - `b` - blob
 * - `h` - int64
 * - `t` - uint64
 * - `d` - double
 * - `T` - True (no argument data)
 * - `F` - False (no argument data)
 * - `N` - Nil (no argument data)
 * - `I` - Infinitum (no argument data)
 */
type MessageArgType = 'i' | 'f' | 's' | 'b' | 'h' | 't' | 'd' | 'T' | 'F' | 'N' | 'I';
/**
 * A TypedMessage consists of an OSC address and an optional array of typed OSC arguments.
 */
type MessageArgValue = number | string | Blob | true | false | null | number;

/**
 * Base class for OSC Atomic Data Types
 */
declare class Atomic {
    /**
     * Create an Atomic instance
     * @param {*} [value] Initial value of any type
     */
    constructor(value?: any);
    /** @type {*} value */
    value: any;
    /** @type {number} offset */
    offset: number;
    /**
     * Interpret the given value of this entity as packed binary data
     * @param {string} method The DataView method to write to the ArrayBuffer
     * @param {number} byteLength Size of array in bytes
     * @return {Uint8Array} Packed binary data
     */
    pack(method: string, byteLength: number): Uint8Array;
    /**
     * Unpack binary data from DataView according to the given format
     * @param {DataView} dataView The DataView holding the binary representation of the value
     * @param {string} method The DataView method to read the format from the ArrayBuffer
     * @param {number} byteLength Size of array in bytes
     * @param {number} [initialOffset=0] Offset of DataView before unpacking
     * @return {number} Offset after unpacking
     */
    unpack(dataView: DataView, method: string, byteLength: number, initialOffset?: number): number;
}

/**
 * Timetag helper class for representing NTP timestamps
 * and conversion between them and javascript representation
 */
declare class Timetag {
    /**
     * Create a Timetag instance
     * @param {number} [seconds=0] Initial NTP *seconds* value
     * @param {number} [fractions=0] Initial NTP *fractions* value
     */
    constructor(seconds?: number, fractions?: number);
    /** @type {number} seconds */
    seconds: number;
    /** @type {number} fractions */
    fractions: number;
    /**
     * Converts from NTP to JS representation and back
     * @param {number} [milliseconds] Converts from JS milliseconds to NTP.
     * Leave empty for converting from NTP to JavaScript representation
     * @return {number} Javascript timestamp
     */
    timestamp(milliseconds?: number): number;
}
/**
 * 64-bit big-endian fixed-point time tag, semantics
 * defined below OSC Atomic Data Type
 */
declare class AtomicTimetag extends Atomic {
    /**
     * Create a AtomicTimetag instance
     * @param {number|Timetag|Date} [value] Initial date, leave empty if
     * you want it to be the current date
     */
    constructor(value?: number | Timetag | Date);
    /**
     * Interpret the given timetag as packed binary data
     * @return {Uint8Array} Packed binary data
     */
    pack(): Uint8Array;
    /**
     * Unpack binary data from DataView and read a timetag
     * @param {DataView} dataView The DataView holding the binary representation of the timetag
     * @param {number} [initialOffset=0] Offset of DataView before unpacking
     * @return {number} Offset after unpacking
     */
    unpack(dataView: DataView, initialOffset?: number): number;
    /** @type {Timetag} value */
    value: Timetag;
}

/**
 * An OSC Bundle consist of a Timetag and one or many Bundle Elements.
 * The elements are either OSC Messages or more OSC Bundles
 */
declare class Bundle {
    /**
     * Create a Bundle instance
     * @param {...*} args Timetag and elements. See examples for options
     *
     * @example
     * const bundle = new Bundle(new Date() + 500)
     *
     * @example
     * const message = new Message('/test/path', 51.2)
     * const anotherBundle = new Bundle([message], Date.now() + 1500)
     *
     * @example
     * const message = new Message('/test/path', 51.2)
     * const anotherMessage = new Message('/test/message', 'test', 12)
     * const anotherBundle = new Bundle(message, anotherMessage)
     */
    constructor(...args: any[]);
    /**
     * @type {number} offset
     * @private
     */
    private offset;
    /** @type {AtomicTimetag} timetag */
    timetag: AtomicTimetag;
    /** @type {array} bundleElements */
    bundleElements: any[];
    /**
     * Take a JavaScript timestamp to set the Bundle's timetag
     * @param {number} ms JS timestamp in milliseconds
     *
     * @example
     * const bundle = new Bundle()
     * bundle.timestamp(Date.now() + 5000) // in 5 seconds
     */
    timestamp(ms: number): void;
    /**
     * Add a Message or Bundle to the list of elements
     * @param {Bundle|Message} item
     */
    add(item: Bundle | Message): void;
    /**
     * Interpret the Bundle as packed binary data
     * @return {Uint8Array} Packed binary data
     */
    pack(): Uint8Array;
    /**
     * Unpack binary data to read a Bundle
     * @param {DataView} dataView The DataView holding the binary representation of a Bundle
     * @param {number} [initialOffset=0] Offset of DataView before unpacking
     * @return {number} Offset after unpacking
     */
    unpack(dataView: DataView, initialOffset?: number): number;
}

/**
 * The unit of transmission of OSC is an OSC Packet. The contents
 * of an OSC packet must be either an OSC Message or an OSC Bundle
 */
declare class Packet {
    /**
     * Create a Packet instance holding a Message or Bundle
     * @param {Message|Bundle} [value] Initial Packet value
     */
    constructor(value?: Message | Bundle);
    /** @type {Message|Bundle} value */
    value: Message | Bundle;
    /**
     * @type {number} offset
     * @private
     */
    private offset;
    /**
     * Packs the Packet value. This implementation is more like
     * a wrapper due to OSC specifications, you could also skip the
     * Packet and directly work with the Message or Bundle instance
     * @return {Uint8Array} Packed binary data
     *
     * @example
     * const message = new Message('/test/path', 21.5, 'test')
     * const packet = new Packet(message)
     * const packetBinary = packet.pack() // then send it via udp etc.
     *
     * // or skip the Packet for convenience
     * const messageBinary = message.pack()
     */
    pack(): Uint8Array;
    /**
     * Unpack binary data from DataView to read Messages or Bundles
     * @param {DataView} dataView The DataView holding a binary representation of a Packet
     * @param {number} [initialOffset=0] Offset of DataView before unpacking
     * @return {number} Offset after unpacking
     */
    unpack(dataView: DataView, initialOffset?: number): number;
}

declare class Plugin {
    /**
     * Returns the current status of the connection
     * @return {number} Status ID
     */
    status(): number;
    /**
     * Open socket connection. Specifics depend on implementation.
     * @param {object} [customOptions] Custom options. See implementation specifics.
     */
    open(customOptions?: object): void;
    /**
     * Close socket connection and anything else used in the implementation.
     */
    close(): void;
    /**
     * Send an OSC Packet, Bundle or Message. Use options here for
     * custom receiver, otherwise the global options will be taken
     * @param {Uint8Array} binary Binary representation of OSC Packet
     * @param {object} [customOptions] Custom options. Specifics depend on implementation.
     */
    send(binary: Uint8Array, customOptions?: object): void;
}

/**
 * OSC plugin for simple OSC messaging via udp client
 * and udp server
 */
declare class DatagramPlugin extends Plugin {
    /**
     * Create an OSC Plugin instance with given options. Defaults to
     * localhost:41234 for server and localhost:41235 for client messaging
     * @param {object} [options] Custom options
     * @param {string} [options.type='udp4'] 'udp4' or 'udp6'
     * @param {string} [options.open.host='localhost'] Hostname of udp server to bind to
     * @param {number} [options.open.port=41234] Port of udp server to bind to
     * @param {boolean} [options.open.exclusive=false] Exclusive flag
     * @param {string} [options.send.host='localhost'] Hostname of udp client for messaging
     * @param {number} [options.send.port=41235] Port of udp client for messaging
     *
     * @example
     * const plugin = new OSC.DatagramPlugin({ send: { port: 9912 } })
     * const osc = new OSC({ plugin: plugin })
     */
    constructor(options?: {
        type?: string;
    });
    /**
     * @type {object} options
     * @private
     */
    private options;
    /**
     * @type {object} socket
     * @private
     */
    private socket;
    /**
     * @type {number} socketStatus
     * @private
     */
    private socketStatus;
    /**
     * @type {function} notify
     * @private
     */
    private notify;
    /**
     * Internal method to hook into osc library's
     * EventHandler notify method
     * @param {function} fn Notify callback
     * @private
     */
    private registerNotify;
    /**
     * Bind a udp socket to a hostname and port
     * @param {object} [customOptions] Custom options
     * @param {string} [customOptions.host='localhost'] Hostname of udp server to bind to
     * @param {number} [customOptions.port=41234] Port of udp server to bind to
     * @param {boolean} [customOptions.exclusive=false] Exclusive flag
     */
    open(customOptions?: {
        host?: string;
        port?: number;
        exclusive?: boolean;
    }): void;
    /**
     * Send an OSC Packet, Bundle or Message. Use options here for
     * custom port and hostname, otherwise the global options will
     * be taken
     * @param {Uint8Array} binary Binary representation of OSC Packet
     * @param {object} [customOptions] Custom options for udp socket
     * @param {string} [customOptions.host] Hostname of udp client
     * @param {number} [customOptions.port] Port of udp client
     */
    send(binary: Uint8Array, customOptions?: {
        host?: string;
        port?: number;
    }): void;
}

/**
 * OSC plugin for a Websocket client running in node or browser context
 */
declare class WebsocketClientPlugin extends Plugin {
    /**
     * Create an OSC WebsocketClientPlugin instance with given options.
     * Defaults to *localhost:8080* for connecting to a Websocket server
     * @param {object} [options] Custom options
     * @param {string} [options.host='localhost'] Hostname of Websocket server
     * @param {number} [options.port=8080] Port of Websocket server
     * @param {boolean} [options.secure=false] Use wss:// for secure connections
     * @param {string|string[]} [options.protocol=''] Subprotocol of Websocket server
     *
     * @example
     * const plugin = new OSC.WebsocketClientPlugin({ port: 9912 })
     * const osc = new OSC({ plugin: plugin })
     */
    constructor(options?: {
        host?: string;
        port?: number;
        secure?: boolean;
        protocol?: string | string[];
    });
    /**
     * @type {object} options
     * @private
     */
    private options;
    /**
     * @type {object} socket
     * @private
     */
    private socket;
    /**
     * @type {number} socketStatus
     * @private
     */
    private socketStatus;
    /**
     * @type {function} notify
     * @private
     */
    private notify;
    /**
     * Internal method to hook into osc library's
     * EventHandler notify method
     * @param {function} fn Notify callback
     * @private
     */
    private registerNotify;
    /**
     * Connect to a Websocket server. Defaults to global options
     * @param {object} [customOptions] Custom options
     * @param {string} [customOptions.host] Hostname of Websocket server
     * @param {number} [customOptions.port] Port of Websocket server
     * @param {boolean} [customOptions.secure] Use wss:// for secure connections
     * @param {string|string[]} [options.protocol] Subprotocol of Websocket server
     */
    open(customOptions?: {
        host?: string;
        port?: number;
        secure?: boolean;
    }): void;
    /**
     * Send an OSC Packet, Bundle or Message to Websocket server
     * @param {Uint8Array} binary Binary representation of OSC Packet
     */
    send(binary: Uint8Array): void;
}

/**
 * This will import the types for JSDoc/Type declarations without
 * impacting the runtime
 * @typedef {import('http').Server|import('https').Server} Server
 */
/**
 * OSC plugin for a Websocket client running in node or browser context
 */
declare class WebsocketServerPlugin extends Plugin {
    /**
     * Create an OSC WebsocketServerPlugin instance with given options.
     * Defaults to *localhost:8080* for the Websocket server
     * @param {object} [options] Custom options
     * @param {string} [options.host='localhost'] Hostname of Websocket server
     * @param {number} [options.port=8080] Port of Websocket server
     * @param {Server} [options.server] Use existing Node.js HTTP/S server
     *
     * @example
     * const plugin = new OSC.WebsocketServerPlugin({ port: 9912 })
     * const osc = new OSC({ plugin: plugin })
     *
     * osc.open() // start server
     * @example <caption>Using an existing HTTP server</caption>
     * const http = require('http')
     * const httpServer = http.createServer();
     * const plugin = new OSC.WebsocketServerPlugin({ server: httpServer })
     * const osc = new OSC({ plugin: plugin })
     */
    constructor(options?: {
        host?: string;
        port?: number;
        server?: Server;
    });
    /**
     * @type {object} options
     * @private
     */
    private options;
    /**
     * @type {object} socket
     * @private
     */
    private socket;
    /**
     * @type {number} socketStatus
     * @private
     */
    private socketStatus;
    /**
     * @type {function} notify
     * @private
     */
    private notify;
    /**
     * Internal method to hook into osc library's
     * EventHandler notify method
     * @param {function} fn Notify callback
     * @private
     */
    private registerNotify;
    /**
     * Start a Websocket server. Defaults to global options
     * @param {object} [customOptions] Custom options
     * @param {string} [customOptions.host] Hostname of Websocket server
     * @param {number} [customOptions.port] Port of Websocket server
     */
    open(customOptions?: {
        host?: string;
        port?: number;
    }): void;
    /**
     * Send an OSC Packet, Bundle or Message to Websocket clients
     * @param {Uint8Array} binary Binary representation of OSC Packet
     */
    send(binary: Uint8Array): void;
}
/**
 * This will import the types for JSDoc/Type declarations without
 * impacting the runtime
 */
type Server = http.Server | https.Server;

/**
 * OSC plugin for setting up communication between a Websocket
 * client and a udp client with a bridge inbetween
 */
declare class BridgePlugin extends Plugin {
    /**
     * Create an OSC Bridge instance with given options. Defaults to
     * localhost:41234 for udp server, localhost:41235 for udp client and
     * localhost:8080 for Websocket server
     * @param {object} [options] Custom options
     * @param {string} [options.udpServer.host='localhost'] Hostname of udp server to bind to
     * @param {number} [options.udpServer.port=41234] Port of udp server to bind to
     * @param {boolean} [options.udpServer.exclusive=false] Exclusive flag
     * @param {string} [options.udpClient.host='localhost'] Hostname of udp client for messaging
     * @param {number} [options.udpClient.port=41235] Port of udp client for messaging
     * @param {string} [options.wsServer.host='localhost'] Hostname of Websocket server
     * @param {number} [options.wsServer.port=8080] Port of Websocket server
     * @param {http.Server|https.Server} [options.wsServer.server] Use existing Node.js HTTP/S server
     * @param {string} [options.receiver='ws'] Where messages sent via 'send' method will be
     * delivered to, 'ws' for Websocket clients, 'udp' for udp client
     *
     * @example
     * const plugin = new OSC.BridgePlugin({ wsServer: { port: 9912 } })
     * const osc = new OSC({ plugin: plugin })
     *
     * @example <caption>Using an existing HTTP server</caption>
     * const http = require('http')
     * const httpServer = http.createServer();
     * const plugin = new OSC.BridgePlugin({ wsServer: { server: httpServer } })
     * const osc = new OSC({ plugin: plugin })
     */
    constructor(options?: object);
    /** @type {object} options
     * @private
     */
    private options;
    /**
     * @type {object} websocket
     * @private
     */
    private websocket;
    /**
     * @type {object} socket
     * @private
     */
    private socket;
    /**
     * @type {number} socketStatus
     * @private
     */
    private socketStatus;
    /**
     * @type {function} notify
     * @private
     */
    private notify;
    /**
     * Internal method to hook into osc library's
     * EventHandler notify method
     * @param {function} fn Notify callback
     * @private
     */
    private registerNotify;
    /**
     * Bind a udp socket to a hostname and port
     * @param {object} [customOptions] Custom options
     * @param {string} [customOptions.host='localhost'] Hostname of udp server to bind to
     * @param {number} [customOptions.port=41234] Port of udp server to bind to
     * @param {boolean} [customOptions.exclusive=false] Exclusive flag
     */
    open(customOptions?: {
        host?: string;
        port?: number;
        exclusive?: boolean;
    }): void;
}

/**
 * OSC interface to send OSC Packets and listen to status changes and
 * incoming message events. Offers a Plugin API for different network
 * protocols, defaults to a simple Websocket client for OSC communication
 * between a browser js-app and a js-node server
 *
 * @example
 * const osc = new OSC()
 *
 * osc.on('/input/test', message => {
 *   // print incoming OSC message arguments
 *   console.log(message.args)
 * })
 *
 * osc.on('open', () => {
 *   const message = new Message('/test/path', 55.12, 'hello')
 *   osc.send(message)
 * })
 *
 * osc.open({ host: '192.168.178.115', port: 9012 })
 */
declare class OSC {
    /**
     * Create an OSC instance with given options
     * @param {object} [options] Custom options
     * @param {boolean} [options.discardLateMessages=false] Ignore incoming
     * messages when given timetag lies in the past
     * @param {Plugin} [options.plugin=WebsocketClientPlugin] Add a connection plugin
     * to this interface, defaults to a plugin with Websocket client.
     * Open README.md for further information on how to handle plugins or
     * how to write your own with the Plugin API
     *
     * @example
     * const osc = new OSC() // default options with Websocket client
     *
     * @example
     * const osc = new OSC({ discardLateMessages: true })
     *
     * @example
     * const websocketPlugin = new OSC.WebsocketClientPlugin()
     * const osc = new OSC({ plugin: websocketPlugin })
     */
    constructor(options?: {
        discardLateMessages?: boolean;
        plugin?: Plugin;
    });
    /**
     * @type {object} options
     * @private
     */
    private options;
    /**
     * @type {EventHandler} eventHandler
     * @private
     */
    private eventHandler;
    /**
     * Listen to a status-change event or incoming OSC message with
     * address pattern matching
     * @param {string} eventName Event name or OSC address pattern
     * @param {function} callback Function which is called on notification
     * @return {number} Subscription id (needed to unsubscribe)
     *
     * @example
     * // will be called when server receives /in!trument/* for example
     * osc.on('/instrument/1', message => {
     *   console.log(message)
     * })
     *
     * @example
     * // will be called for every message since it uses the wildcard symbol
     * osc.on('*', message => {
     *   console.log(message)
     * })
     *
     * @example
     * // will be called on network socket error
     * osc.on('error', message => {
     *   console.log(message)
     * })
     */
    on(eventName: string, callback: Function): number;
    /**
     * Unsubscribe an event listener
     * @param {string} eventName Event name or OSC address pattern
     * @param {number} subscriptionId The subscription id
     * @return {boolean} Success state
     *
     * @example
     * const listenerId = osc.on('error', message => {
     *   console.log(message)
     * })
     * osc.off('error', listenerId) // unsubscribe from error event
     */
    off(eventName: string, subscriptionId: number): boolean;
    /**
     * Open network socket with plugin. This method is used by
     * plugins and is not available without (see Plugin API for more information)
     * @param {object} [options] Custom global options for plugin instance
     *
     * @example
     * const osc = new OSC({ plugin: new OSC.DatagramPlugin() })
     * osc.open({ host: '127.0.0.1', port: 8080 })
     */
    open(options?: object): any;
    /**
     * Returns the current status of the connection. See *STATUS* for
     * different possible states. This method is used by plugins
     * and is not available without (see Plugin API for more information)
     * @return {number} Status identifier
     *
     * @example
     * import OSC, { STATUS } from 'osc'
     * const osc = new OSC()
     * if (osc.status() === STATUS.IS_CONNECTING) {
     *   // do something
     * }
     */
    status(): number;
    /**
     * Close connection. This method is used by plugins and is not
     * available without (see Plugin API for more information)
     */
    close(): any;
    /**
     * Send an OSC Packet, Bundle or Message. This method is used by plugins
     * and is not available without (see Plugin API for more information)
     * @param {Packet|Bundle|Message|TypedMessage} packet OSC Packet, Bundle or Message instance
     * @param {object} [options] Custom options
     *
     * @example
     * const osc = new OSC({ plugin: new OSC.DatagramPlugin() })
     * osc.open({ host: '127.0.0.1', port: 8080 })
     *
     * const message = new OSC.Message('/test/path', 55.1, 57)
     * osc.send(message)
     *
     * // send message again to custom address
     * osc.send(message, { host: '192.168.178.115', port: 9001 })
     */
    send(packet: Packet | Bundle | Message | TypedMessage, options?: object): any;
}
declare namespace OSC {
    export { STATUS };
    export { Packet };
    export { Bundle };
    export { Message };
    export { TypedMessage };
    export { Plugin };
    export { DatagramPlugin };
    export { WebsocketClientPlugin };
    export { WebsocketServerPlugin };
    export { BridgePlugin };
}

declare namespace STATUS {
    const IS_NOT_INITIALIZED: number;
    const IS_CONNECTING: number;
    const IS_OPEN: number;
    const IS_CLOSING: number;
    const IS_CLOSED: number;
}

export { OSC as default };
