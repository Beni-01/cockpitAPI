import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeNotifierService } from './services/realtime-notifier.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/google-sheets',
})
export class GoogleSheetsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('GoogleSheetsGateway');

    constructor(private realtimeNotifier: RealtimeNotifierService) { }

    afterInit(server: Server) {
        this.realtimeNotifier.setServer(server);
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribe:config')
    handleSubscribeToConfig(client: Socket, configId: number) {
        const room = `config-${configId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} subscribed to ${room}`);
        return { event: 'subscribed', data: { configId, room } };
    }

    @SubscribeMessage('unsubscribe:config')
    handleUnsubscribeFromConfig(client: Socket, configId: number) {
        const room = `config-${configId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
        return { event: 'unsubscribed', data: { configId, room } };
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket) {
        return { event: 'pong', data: { timestamp: new Date() } };
    }
}
