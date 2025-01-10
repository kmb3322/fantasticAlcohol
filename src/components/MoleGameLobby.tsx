// client/src/components/MoleGameLobby.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import generateRandomId from '../utils/generateRandomId';

type MoleGameLobbyProps = {
  onJoinedRoom: (roomCode: string, isHost: boolean) => void;
};

function MoleGameLobby({ onJoinedRoom }: MoleGameLobbyProps) {
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // 플레이어 목록(로비에서 확인용)
  const [playerList, setPlayerList] = useState<any[]>([]);

  useEffect(() => {
    // 유저 ID 생성
    setUserId(generateRandomId());

    // playerList 이벤트 수신
    const handlePlayerList = (players: any[]) => {
      setPlayerList(players);
    };
    socket.on('mole:playerList', handlePlayerList);

    // joinError 수신
    const handleJoinError = (msg: string) => {
      alert(msg);
    };
    socket.on('joinError', handleJoinError);

    // roomCreated (방 생성 완료)
    const handleRoomCreated = ({ roomCode }: { roomCode: string }) => {
      // 방장으로서의 진입
      onJoinedRoom(roomCode, true);
    };
    socket.on('mole:roomCreated', handleRoomCreated);

    return () => {
      socket.off('mole:playerList', handlePlayerList);
      socket.off('joinError', handleJoinError);
      socket.off('mole:roomCreated', handleRoomCreated);
    };
  }, [onJoinedRoom]);

  // 새 방 만들기
  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    socket.emit('mole:createRoom', { userId, nickname });
  };

  // 기존 방 입장
  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    if (!roomCode.trim()) {
      alert('방 코드를 입력하세요.');
      return;
    }
    socket.emit('mole:joinRoom', { roomCode, userId, nickname });
    // 이 시점에서 방장 여부는 알 수 없으므로 false
    onJoinedRoom(roomCode, false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>두더지 잡기 - 로비 화면</h2>
      <p>내 유저 ID: {userId}</p>
      <div>
        <label>닉네임: </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
        />
      </div>
      <br />
      <button onClick={handleCreateRoom}>새 방 만들기</button>

      <hr />
      <div>
        <label>방 코드(6자리): </label>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="000000"
        />
      </div>
      <button onClick={handleJoinRoom}>해당 방 입장</button>

      <hr />
      <h4>현재 로비에서 받은 playerList</h4>
      <p>※ 로비에서 보여주는 인원은 "같은 방"에 들어온 경우만 제대로 뜰 수 있어요.</p>
      <p>현재 인원: {playerList.length}명</p>
      <ul>
        {playerList.map((p) => (
          <li key={p.socketId}>
            {p.nickname} ({p.score}점)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MoleGameLobby;
