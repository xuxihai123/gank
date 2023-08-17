export const AUTH_REQ = 0x0; // start auth
export const AUTH_RES = 0x1; // auth response

export const TUNNEL_REQ = 0xa6; // start tunnel
export const TUNNEL_RES = 0xa9; // response tunnel

// ping pong
export const PING_FRAME = 0x6;
export const PONG_FRAME = 0x9;

// stream
export const STREAM_INIT = 0xf0;
export const STREAM_EST = 0xf1;
export const STREAM_DATA = 0xf2;
export const STREAM_FIN = 0xf3;
export const STREAM_RST = 0xf4;

export class AuthFrame {
    type: number;
    token: string;
    status: number;
    constructor(type: number, token: string, status: number) {
        this.type = type;
        this.token = token || 'xxxxxxxxxxx';
        this.status = status;
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type, this.status]);
        return Buffer.concat([prefix, Buffer.from(this.token)]);
    }
}

export class PingFrame {
    type: number;
    stime: string;
    constructor(type: number, stime: string) {
        this.type = type;
        this.stime = stime;
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type]);
        return Buffer.concat([prefix, Buffer.from(this.stime)]);
    }
}

export class PongFrame {
    type: number;
    stime: string;
    atime: string;
    constructor(type: number, stime: string, atime: string) {
        this.type = type;
        this.stime = stime;
        this.atime = atime;
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type]);
        return Buffer.concat([prefix, Buffer.from(this.stime), Buffer.from(this.atime)]);
    }
}

export class TunnelReqFrame {
    type: number;
    protocol: number;
    port: number = 0;
    subdomain: string = '';
    name: string;

    static getProtocolNo(proto: string) {
        return proto === 'tcp' ? 0x1 : 0x2; // tcp 0x1, web 0x2
    }
    constructor(type: number, protype: number, name: string, port: number, sudomain: string) {
        this.type = type;
        this.name = name;
        if (protype === 0x1) {
            this.protocol = 0x1;
            this.port = port;
        } else {
            this.protocol = 0x2;
            this.subdomain = sudomain;
        }
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type, this.protocol]);
        let message = '';
        if (this.protocol === 0x1) {
            message = `${this.name}:${this.port}`;
        } else {
            message = `${this.name}:${this.subdomain}`;
        }
        return Buffer.concat([prefix, Buffer.from(message)]);
    }
}

export class TunnelResFrame {
    type: number;
    status: number;
    message: string;
    constructor(type: number, status: number, message: string) {
        this.type = type;
        this.status = status;
        this.message = message;
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type]);
        const len = this.message.length;
        const lenBuf = Buffer.from([len >> 8, len % 256]);

        const messageBuf = Buffer.from(this.message);
        return Buffer.concat([prefix, Buffer.from([this.status]), lenBuf, messageBuf]);
    }
}

export class StreamFrame {
    type: number;
    streamId: string;
    data?: Buffer;
    constructor(type: number, streamId: string, data?: Buffer) {
        this.type = type;
        this.streamId = streamId;
        this.data = data;
    }

    encode(): Buffer {
        const prefix = Buffer.from([this.type]);
        const buf = Buffer.concat([prefix, Buffer.from(this.streamId, 'hex')]);
        if (!this.data) {
            return buf;
        } else {
            return Buffer.concat([buf, this.data]);
        }
    }
}
