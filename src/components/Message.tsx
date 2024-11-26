import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ref, remove } from "firebase/database";
import { db } from '../firebase';

// 掲示板のメッセージクラス
export class Message {
    private key: string;
    private photoURL: string;
    private name: string;
    private date: string;
    private message: string;
    private userId: string;
    private isRight: boolean = false;

    constructor(key: string, photoURL: string, name: string, date: string, message: string, userId: string) {
        this.key = key;
        this.photoURL = photoURL;
        this.name = name;
        this.date = date;
        this.message = message;
        this.userId = userId;
    }

    private handleDelete = (key: string) => {
        remove(ref(db, 'chat/' + key));
    };

    private setIsRight = (uId: string) => (uId === this.userId ? (this.isRight = true) : (this.isRight = false));

    public getMessage = (uId: string) => {
        this.setIsRight(uId);
        return (
            <Grid
                key={this.key}
                container
                spacing={2}
                justifyContent={`${this.isRight ? 'flex-end' : 'flex-start'}`}
                sx={{
                    padding: { xs: 1, sm: 2 }, // デバイスに応じた余白
                    maxWidth: '100%', // 最大幅を制限
                }}
            >
                <Card
                    elevation={2}
                    sx={{
                        width: { xs: '90%', sm: '75%', md: '50%' }, // デバイスに応じた幅
                        marginBottom: 2,
                        borderRadius: 8,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                height: '30px',
                                fontSize: { xs: '0.8rem', sm: '1rem' }, // フォントサイズを調整
                            }}
                        >
                            {`${this.name} (${this.date})`}
                        </Typography>
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2, // 子要素間のスペース
                                flexWrap: 'wrap', // 狭い画面で折り返し
                            }}
                        >
                            <Avatar
                                alt={this.name}
                                src={this.photoURL}
                                sx={{
                                    width: { xs: 32, sm: 40 }, // アバターサイズ調整
                                    height: { xs: 32, sm: 40 },
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    backgroundColor: `${this.isRight ? 'lightskyblue' : 'lightgray'}`,
                                    padding: 2,
                                    borderRadius: 2,
                                    fontSize: { xs: '0.9rem', sm: '1rem' }, // フォントサイズ調整
                                    maxWidth: '100%',
                                    wordBreak: 'break-word', // 長いメッセージ対応
                                }}
                            >
                                {`${this.message}`}
                            </Typography>
                            <Tooltip title="Delete Message">
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => this.handleDelete(this.key)}
                                    sx={{
                                        fontSize: { xs: '0.8rem', sm: '1rem' }, // デバイスに応じたサイズ
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </CardContent>
                    </CardContent>
                </Card>
            </Grid>
        );
    };
}
