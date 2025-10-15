# C64 BASIC Course Map - 64 Lessons

Extracted from Code198x LESSON_OBJECTIVES_MAP.md for validation purposes.

Each lesson: 15-20 minutes, ends with runnable WOW moment.

## Week 1 - Hello, Machine

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 1 | Talk to Me | Use PRINT to display text and understand BASIC prompt | PRINT, immediate mode |
| 2 | Timing Is Everything | Use FOR/NEXT loops and delays to control pace | FOR/NEXT, timing |
| 3 | Decisions, Decisions | Add IF/THEN logic for interactivity | IF/THEN |
| 4 | Counting on You | Store and manipulate data with variables | Variables |
| 5 | Random Encounters | Generate unpredictability with RND | RND |
| 6 | Simple Animation | Move text smoothly and clear screen | Screen control |
| 7 | Sound Off | Make basic tones via POKE and SID registers | POKE, SID basics |
| 8 | Mini-Game: Typing Turmoil | Combine input, timing, and sound for reflex challenge | Integration |

## Week 2 - Moving Pictures

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 9 | Gridlocked | Create 2-D arrays and draw grids | Arrays |
| 10 | Logic & Motion | Use compound conditions AND/OR | AND/OR operators |
| 11 | Text Tricks | Manipulate strings with LEFT$, MID$, RIGHT$ | String functions |
| 12 | Memory Games | Load DATA tables with READ/RESTORE | DATA/READ/RESTORE |
| 13 | Smarter Decisions | Handle boundaries and collisions | Boundary checks |
| 14 | Building Worlds | Nested loops for backgrounds and maps | Nested loops |
| 15 | Math Magic | Reusable formulas with DEF FN | DEF FN |
| 16 | Mini-Game: Maze Craze | Explore generated maze with keyboard input | Integration |

## Week 3 - Playable Worlds

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 17 | The Art of Movement | Track and update player position | Player state |
| 18 | Collision Course | Detect and react to object contact | Collision detection |
| 19 | Scorekeeping | Display changing scores in real time | Score display |
| 20 | Life and Death | Manage lives and counters | Game state |
| 21 | ON…GOTO Power | Switch logic based on state | ON GOTO |
| 22 | Subroutines & GOSUB | Organise code into reusable pieces | GOSUB/RETURN |
| 23 | Sprites by POKE | Draw and move a single sprite | Sprite basics |
| 24 | Mini-Game: SID Invaders | Simple shooter using DATA and sound | Integration |

## Week 4 - Sounds and Sensations

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 25 | Voices of the SID | Learn waveforms and registers | SID waveforms |
| 26 | Simple Tunes | Loop melodies with timing control | Music loops |
| 27 | Envelopes | Shape sound with volume and duration | ADSR |
| 28 | Input Beats Output | Turn keyboard input into notes | Interactive sound |
| 29 | Random Rhythms | Procedural sound generation | Generative audio |
| 30 | Dynamic Sound Effects | Link sound to gameplay | SFX integration |
| 31 | Visualisers | Animate graphics to music | Audio visualization |
| 32 | Mini-Game: Beat Blaster | Sound-driven reaction game | Integration |

## Week 5 - Maps and Motion

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 33 | Paging the Screen | Scroll text and simulate camera motion | Screen scrolling |
| 34 | Level Design by DATA | Store tile maps efficiently | Map data |
| 35 | Smooth Scrolling | Create continuous motion illusions | Smooth motion |
| 36 | Verticality | Manage two-axis movement | 2D movement |
| 37 | Simple AI | Basic enemy behaviours | AI basics |
| 38 | Collision Layers | Handle overlapping entities | Layer management |
| 39 | Game Loops Revisited | Control timing and pacing precisely | Game loop |
| 40 | Mini-Game: Scroll Runner | Side-scroller testing speed and collision | Integration |

## Week 6 - Game Logic

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 41 | Finite State Fun | Manage game states with variables | State machines |
| 42 | Random Opponents | Create patterned but unpredictable AI | AI patterns |
| 43 | Shooting Stars | Spawn and move projectiles | Projectiles |
| 44 | Hit Detection | Compare coordinates for impacts | Hit detection |
| 45 | Power-Ups | Add conditional bonuses and effects | Power-ups |
| 46 | Balancing Act | Control difficulty progression | Difficulty curves |
| 47 | Saving Scores | Persist scores with DATA or file save | Data persistence |
| 48 | Mini-Game: Cosmic Clash | Complete top-down shooter in BASIC | Integration |

## Week 7 - Under the Hood

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 49 | Libraries in BASIC | Create and reuse subroutines | Code organization |
| 50 | Title Screens | Design simple intros and attract loops | UI screens |
| 51 | Menus & Options | Input-based navigation | Menu systems |
| 52 | Multiple Levels | Reset and reload game state | Level management |
| 53 | Cutscenes in BASIC | Text-based storytelling | Narrative |
| 54 | Debugging Retro-Style | Use PRINT and counters to trace errors | Debugging |
| 55 | Optimising for Speed | Trim variables and loops for performance | Optimization |
| 56 | Mini-Game: Galactic Miner | Multi-screen game with menus and levels | Integration |

## Week 8 - Hitting the Limits

| # | Title | Objective | Key Concepts |
|---|-------|-----------|--------------|
| 57 | Making It Feel Right | Test pacing and responsiveness | Game feel |
| 58 | Squeezing Speed | Push BASIC's limits; measure performance | Performance |
| 59 | When BASIC Breaks | Find and understand bottlenecks | Limitations |
| 60 | Under the Skin | Peek at memory and screen layout directly | Memory inspection |
| 61 | POKE the Future | Use SYS and machine-code snippets safely | ML integration |
| 62 | Looking Below | Compare BASIC and machine code side by side | BASIC vs ML |
| 63 | The Threshold | Reflect on what BASIC can and can't do | Reflection |
| 64 | Retrospective: The Journey So Far | Celebrate progress; review key ideas | Course wrap-up |

## Validation Notes

- Lessons 8, 16, 24, 32, 40, 48, 56 are mini-games (integration lessons)
- Each mini-game combines concepts from previous 7 lessons
- 20-40 line WOW moment programs expected
- No indentation in C64 BASIC V2 code
- Must validate: PRINT, POKE, PEEK, FOR/NEXT, IF/THEN, AND/OR, READ/DATA, GOSUB/RETURN, SYS
