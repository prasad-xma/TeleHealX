import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Loader2, Mic, MicOff, PhoneOff, Video, VideoOff, Users } from 'lucide-react';
import type { LocalAudioTrack, LocalTrack, LocalVideoTrack, RemoteTrack, Room } from 'twilio-video';
import { createTelemedicineToken } from '../services/telemedicineService';

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { roomName: roomNameParam } = useParams();
  const roomName = useMemo(() => {
    try {
      return decodeURIComponent(roomNameParam || '').trim();
    } catch {
      return (roomNameParam || '').trim();
    }
  }, [roomNameParam]);

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasLocalVideoPreview, setHasLocalVideoPreview] = useState(false);

  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  const currentUserLabel = useMemo(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      return 'You';
    }

    try {
      const user = JSON.parse(userRaw);
      return user?.name || 'You';
    } catch {
      return 'You';
    }
  }, []);

  const getIdentityLabel = (identity: string) => {
    if (!identity) {
      return 'Participant';
    }

    if (identity.startsWith('doctor-')) {
      return 'Doctor';
    }

    if (identity.startsWith('patient-')) {
      return 'Patient';
    }

    return identity;
  };

  const isMediaRemoteTrack = (track: RemoteTrack): track is RemoteTrack & { attach: () => HTMLElement } => {
    return track.kind === 'audio' || track.kind === 'video';
  };

  const isMediaLocalTrack = (track: LocalTrack): track is LocalAudioTrack | LocalVideoTrack => {
    return (track.kind === 'audio' || track.kind === 'video') && typeof track.stop === 'function';
  };

  const attachRemoteTrack = (track: RemoteTrack, container: HTMLDivElement) => {
    if (!isMediaRemoteTrack(track)) {
      return;
    }

    const attachedElement = track.attach();
    attachedElement.setAttribute('style', 'width:100%;max-height:270px;object-fit:cover;border-radius:12px;background:#0f172a;');
    container.appendChild(attachedElement);
  };

  const renderRemoteParticipants = (activeRoom: Room) => {
    const container = remoteVideoContainerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const identities: string[] = [];

    activeRoom.participants.forEach((participant) => {
      identities.push(participant.identity || 'Participant');

      const card = document.createElement('div');
      card.setAttribute('style', 'background:#0b1220;border:1px solid #1e293b;border-radius:14px;padding:0.75rem;display:grid;gap:0.5rem;');

      const label = document.createElement('div');
      label.setAttribute('style', 'color:#cbd5e1;font-size:0.85rem;font-weight:700;');
      label.textContent = getIdentityLabel(participant.identity);

      const media = document.createElement('div');
      media.setAttribute('style', 'display:grid;gap:0.5rem;');

      participant.tracks.forEach((publication) => {
        if (publication.isSubscribed && publication.track) {
          attachRemoteTrack(publication.track, media);
        }
      });

      card.appendChild(label);
      card.appendChild(media);
      container.appendChild(card);
    });

    setParticipants(identities);
  };

  const detectAvailableMediaDevices = async () => {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
      return { hasAudioInput: false, hasVideoInput: false };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioInput = devices.some((device) => device.kind === 'audioinput');
    const hasVideoInput = devices.some((device) => device.kind === 'videoinput');

    return { hasAudioInput, hasVideoInput };
  };

  useEffect(() => {
    if (!roomName) {
      setError('Room name is missing');
      setLoading(false);
      return;
    }

    let activeRoom: Room | null = null;

    const joinRoom = async () => {
      setLoading(true);
      setError('');
      let connectFn: ((token: string, options: any) => Promise<Room>) | null = null;

      try {
        const twilioModule = await import('twilio-video');
        connectFn = twilioModule.connect;

        const tokenResponse = await createTelemedicineToken(roomName);
        const token = tokenResponse?.token;

        if (!token) {
          throw new Error('Failed to generate Twilio token');
        }

        const { hasAudioInput, hasVideoInput } = await detectAvailableMediaDevices();

        if (!hasAudioInput && !hasVideoInput) {
          setNotice('No microphone or camera was found on this device. You joined in listen/view mode.');
        } else if (!hasVideoInput) {
          setNotice('Camera was not found on this device. You joined with audio only.');
        } else if (!hasAudioInput) {
          setNotice('Microphone was not found on this device. You joined with video only.');
        }

        const connectedRoom = await connectFn(token, {
          name: roomName,
          audio: hasAudioInput,
          video: hasVideoInput ? { width: 640 } : false
        });

        activeRoom = connectedRoom;
        setRoom(connectedRoom);

        const localParticipant = connectedRoom.localParticipant;
        const localVideoPublication = Array.from(localParticipant.videoTracks.values()).find((publication) => publication.track);
        const localAudioPublication = Array.from(localParticipant.audioTracks.values()).find((publication) => publication.track);

        localVideoTrackRef.current = (localVideoPublication?.track as LocalVideoTrack | null) || null;
        localAudioTrackRef.current = (localAudioPublication?.track as LocalAudioTrack | null) || null;

        const localContainer = localVideoContainerRef.current;
        if (localContainer) {
          localContainer.innerHTML = '';
          setHasLocalVideoPreview(false);

          const localVideoTrack = localVideoTrackRef.current;

          if (localVideoTrack) {
            const localElement = localVideoTrack.attach();
            localElement.setAttribute('style', 'width:100%;max-height:260px;object-fit:cover;border-radius:12px;background:#0f172a;');
            localContainer.appendChild(localElement);
            setHasLocalVideoPreview(true);
          }
        }

        connectedRoom.participants.forEach((participant) => {
          participant.on('trackSubscribed', () => renderRemoteParticipants(connectedRoom));
          participant.on('trackUnsubscribed', () => renderRemoteParticipants(connectedRoom));
        });

        connectedRoom.on('participantConnected', (participant) => {
          participant.on('trackSubscribed', () => renderRemoteParticipants(connectedRoom));
          participant.on('trackUnsubscribed', () => renderRemoteParticipants(connectedRoom));
          renderRemoteParticipants(connectedRoom);
        });

        connectedRoom.on('participantDisconnected', () => {
          renderRemoteParticipants(connectedRoom);
        });

        renderRemoteParticipants(connectedRoom);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Unable to join Twilio room';

        if (typeof message === 'string' && message.toLowerCase().includes('requested device not found')) {
          try {
            const tokenResponse = await createTelemedicineToken(roomName);
            const token = tokenResponse?.token;

            if (!token) {
              throw new Error('Failed to generate Twilio token');
            }

            if (!connectFn) {
              const twilioModule = await import('twilio-video');
              connectFn = twilioModule.connect;
            }

            const fallbackRoom = await connectFn(token, {
              name: roomName,
              audio: false,
              video: false
            });

            activeRoom = fallbackRoom;
            setRoom(fallbackRoom);
            setNotice('Microphone/camera is unavailable on this device. You joined without local media.');
            renderRemoteParticipants(fallbackRoom);
            return;
          } catch (fallbackError: any) {
            setError(fallbackError?.response?.data?.message || fallbackError?.message || 'Unable to join Twilio room');
            return;
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    joinRoom();

    return () => {
      if (activeRoom) {
        activeRoom.localParticipant.tracks.forEach((publication) => {
          if (publication.track && isMediaLocalTrack(publication.track)) {
            publication.track.stop();
            publication.track.detach().forEach((element: Element) => element.remove());
          }
        });

        activeRoom.disconnect();
      }

      setHasLocalVideoPreview(false);
    };
  }, [roomName]);

  const handleToggleMic = () => {
    const track = localAudioTrackRef.current;
    if (!track) {
      return;
    }

    if (isMicEnabled) {
      track.disable();
    } else {
      track.enable();
    }

    setIsMicEnabled(!isMicEnabled);
  };

  const handleToggleVideo = () => {
    const track = localVideoTrackRef.current;
    if (!track) {
      return;
    }

    if (isVideoEnabled) {
      track.disable();
    } else {
      track.enable();
    }

    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleLeaveCall = () => {
    if (room) {
      room.localParticipant.tracks.forEach((publication) => {
        if (publication.track && isMediaLocalTrack(publication.track)) {
          publication.track.stop();
          publication.track.detach().forEach((element: Element) => element.remove());
        }
      });
      room.disconnect();
    }

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-['Nunito',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto grid gap-4 md:gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white m-0">Twilio Consultation Room</h1>
            <p className="text-slate-300 mt-1 mb-0">Room: {roomName || 'Unknown room'}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-slate-200 text-sm font-semibold">
            <Users size={16} />
            {participants.length + 1} in call
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-100 px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            {notice}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-300 font-semibold flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Connecting to Twilio room...
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm font-bold text-slate-300 mb-3">{currentUserLabel} (You)</div>
            <div ref={localVideoContainerRef} className="min-h-56 rounded-xl bg-slate-950" />
            {!hasLocalVideoPreview ? (
              <div className="text-slate-500 text-sm grid place-items-center min-h-44 border border-slate-800 rounded-lg mt-3">
                Local camera preview
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm font-bold text-slate-300 mb-3">Remote Participant</div>
            <div ref={remoteVideoContainerRef} className="min-h-56 rounded-xl bg-slate-950 p-3 grid gap-3" />
            {participants.length === 0 ? (
              <div className="text-slate-500 text-sm grid place-items-center min-h-44 border border-slate-800 rounded-lg mt-3">
                Waiting for another participant to join...
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleToggleMic}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700"
          >
            {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            {isMicEnabled ? 'Mute' : 'Unmute'}
          </button>

          <button
            onClick={handleToggleVideo}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700"
          >
            {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            {isVideoEnabled ? 'Video Off' : 'Video On'}
          </button>

          <button
            onClick={handleLeaveCall}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-bold border border-red-500/60 bg-red-600 hover:bg-red-500 text-white"
          >
            <PhoneOff size={16} />
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
