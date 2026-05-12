MUSIC_RECOMMENDATIONS = {
    "Anxiety": [
        {
            "title": "Lo-fi Focus",
            "type": "music",
            "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
        },
        {
            "title": "Rain Ambience",
            "type": "ambience",
            "url": "https://www.youtube.com/watch?v=mPZkdNFkNps",
        },
    ],
    "Burnout": [
        {
            "title": "Soft Piano Relaxation",
            "type": "music",
            "url": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
        },
        {
            "title": "Forest Sounds",
            "type": "ambience",
            "url": "https://www.youtube.com/watch?v=xNN7iTA57jM",
        },
    ],
    "Loneliness": [
        {
            "title": "Warm Acoustic Comfort",
            "type": "music",
            "url": "https://www.youtube.com/watch?v=2OEL4P1Rz04",
        }
    ],
    "Calm": [
        {
            "title": "Meditation Soundscape",
            "type": "music",
            "url": "https://www.youtube.com/watch?v=inpok4MKVLM",
        }
    ],
}


def get_music_recommendations(emotion: str):

    return MUSIC_RECOMMENDATIONS.get(emotion, MUSIC_RECOMMENDATIONS["Calm"])
