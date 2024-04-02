import socketio
import asyncio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print('Client connected', sid)

@sio.event
async def disconnect(sid):
    print('Client disconnected', sid)

@sio.event
async def message(sid, data):
    print('Message received:', data)
    await sio.emit('reply', {'response': 'Message received!'}, room=sid)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8001)
