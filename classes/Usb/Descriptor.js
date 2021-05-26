const DeviceClasses = Object.freeze({
    device: {
        0: {
            name: 'unknown'
        },
        2: {
            name: 'communications'
        },
        9: {
            name: 'hub',
            subclasses: {
                0: {
                    protocols: {
                        0: {
                            name: 'full_speed'
                        },
                        1: {
                            name: 'high_speed_single_tt'
                        },
                        2: {
                            name: 'high_speed_single_tts'
                        }
                    }
                }
            }
        },
        17: {
            name: 'billboard'
        },
        220: {
            name: 'diagnostic'
        },
        239: {
            name: 'miscellaneous'
        },
        255: {
            name: 'vendor_specific'
        }
    },
    interface: {
        1: {
            name: 'audio'
        },
        2: {
            name: 'communications'
        },
        3: {
            name: 'hid'
        },
        5: {
            name: 'physical'
        },
        7: {
            name: 'printer'
        },
        8: {
            name: 'msd'
        },
        10: {
            name: 'cdc'
        },
        11: {
            name: 'smart_card'
        },
        13: {
            name: 'content_security'
        },
        14: {
            name: 'wireless'
        },
        15: {
            name: 'personal_healthcare'
        },
        16: {
            name: 'audio_video',
            subclasses: {
                1: {
                    name: 'audio_video'
                },
                2: {
                    name: 'video'
                },
                3: {
                    name: 'audio'
                }
            }
        },
        220: {
            name: 'diagnostic'
        },
        239: {
            name: 'miscellaneous'
        },
        254: {
            name: 'application_specific'
        },
        255: {
            name: 'vendor_specific'
        }
    }
})

module.exports = {
    DeviceClasses
}