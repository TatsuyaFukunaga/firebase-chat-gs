import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Message } from './Message';
import TextField from '@mui/material/TextField';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { db } from '../firebase';
import { ref, set, push, onValue } from "firebase/database";
import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { unsubscribe } from 'diagnostics_channel';

export default function Header() {
    // アラートの表示、非表示のhook
    const [open, setOpen] = React.useState(false);
    // アラートの表示メソッド
    const handleClickOpen = () => {
        setOpen(true);
    };
    // アラートの非表示メソッド
    const handleClose = () => {
        setOpen(false);
    };
    // アラートのテキストのhook
    const [alertText, setAlertText] = useState("");
    //アラートの表題のhook
    const [alartTextTitle, setAlertTextTitle] = useState("");
    // データベースの参照ポイント
    const dbRef = ref(db, "chat");
    // firebase authユーザーのhook
    const [user] = useAuthState(auth);
    // メッセージが更新、削除された時のhook
    const [mg, setMg] = useState<Message[]>([]);
    // 追加される新しいmessageのhook
    const [message, setMessage] = useState("");
    // firebase authのログイン表示のhook
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    // firebase authのログアウト表示メニュー
    const settings = ['Logout'];
    // firebase authのメニュー表示
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    // firebase authのログアウトメニューを押したときのログアウト処理
    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        if (event.currentTarget.innerText === "Logout") auth.signOut();
        setAnchorElUser(null);
    };
    // メッセージ欄に入力があったときにメッセージの状態変数に代入hook処理
    const handleInputMessage = (e: any) => {
        setMessage(e.target.value);
    };
    // メッセージの入力ボタンが押された時の処理
    const handleClickInput = () => {
        if (user) {
            if (message !== "") {
                const msg = {
                    uname: user ? `${user.displayName}` : "null",
                    txt: message,
                    photoURL: user ? `${user.photoURL}` : "./null.jpg",
                    userId: user ? `${user.email}` : "",
                    date: `${(new Date(Date.now())).toLocaleString()}`
                }
                const newPostRef = push(dbRef);
                set(newPostRef, msg);
            }
            else {
                setAlertText("messageが入力されていません。");
                setAlertTextTitle("Null message");
                handleClickOpen();
            }

        }
        else {
            setAlertText("googleにログインして下さい。");
            setAlertTextTitle("Not logined");
            handleClickOpen();
        }

    };
    // googleログイン処理
    const googleLogin = () => {
        signInWithPopup(auth, provider);
    }
    // 掲示板メッセージに変更、削除があった時、ユーザー変更があったときの処理
    useEffect(() => {
        const messagesRef = ref(db, "chat");
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            let loadedMessages: Message[] = [];
            for (let id in data) {
                const key = id;
                const msg = data[id];
                const mg: Message = new Message(`${key}`, `${msg.photoURL}`, `${msg.uname}`, `${msg.date}`, `${msg.txt}`, `${msg.userId}`);
                loadedMessages.push(mg);
            }
            setMg(loadedMessages);
        });
    }, [user]);

    // JSX全体の表示
    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {`${alartTextTitle}`}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {alertText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog >
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                            Firebase Chat App
                        </Typography>
                        {user ?
                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={user ? `${user.displayName}` : "null"} src={user ? `${user.photoURL}` : "./null.jpg"} />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                            <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                            :
                            <Button color="inherit" onClick={() => googleLogin()}>Login</Button>
                        }
                    </Toolbar>
                </AppBar>
            </Box>
            <Box
                component="form"
                sx={{ justifyContent: 'flex-end' }}
                noValidate
                autoComplete="off"
                display={'flex'}
            >
                <TextField onChange={(e) => handleInputMessage(e)} className='outlined-basic' id="outlined-basic" label="Message" variant="outlined" sx={{ display: 'flex', marginTop: '20px', marginBottom: '20px', marginRight: '10px' }} fullWidth />
                <IconButton sx={{ verticalAlign: 'middle', marginRight: '20px' }} onClick={() => handleClickInput()}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            {mg.map(
                (item, index) => mg[mg.length - index - 1].getMessage(user ? `${user.email}` : "")
            )}
        </>

    );
}
