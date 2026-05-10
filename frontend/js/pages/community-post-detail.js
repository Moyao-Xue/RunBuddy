const posts = {
            mia: {
                author: "Mia Chen",
                initial: "M",
                avatarClass: "avatar-mia",
                time: "Today 07:42",
                title: "Easy pace saved my long runs",
                body: "Tried keeping the first 5K conversational today. Finished stronger and no knee tightness after stretching.\n\nI used to chase pace from the first kilometer, but now I treat long runs like patience practice. Warm up slowly, sip water before feeling thirsty, and save the faster effort for the last 10 minutes.",
                likes: "18 likes",
                comments: [
                    ["Leo Park", "This is exactly what my coach keeps telling me. Going to try the conversational test this weekend.", "08:05"],
                    ["Ava Stone", "The last 10 minutes faster idea sounds doable. Nice tip!", "08:21"],
                    ["Noah Kim", "Slow starts have helped my knees too. Consistency beats one fast split.", "09:10"]
                ]
            },
            leo: {
                author: "Leo Park",
                initial: "L",
                avatarClass: "avatar-leo",
                time: "Yesterday 20:18",
                title: "Anyone joining the city marathon?",
                body: "Looking for a 5:30 pace buddy for the first half. Planning a relaxed start and steady fueling every 7K.\n\nMy goal is to stay calm through 25K, then decide whether to push. If anyone is in the same start wave, let's meet near the blue balloon pacer 20 minutes before the gun.",
                likes: "24 likes",
                comments: [
                    ["Mia Chen", "I am aiming around 5:35. Happy to run the first 10K together.", "20:41"],
                    ["Sofia Liu", "Good luck! The blue pacer meetup point is easy to find.", "21:02"],
                    ["Noah Kim", "Fuel every 7K sounds smart. I may join if my bib wave matches.", "21:30"]
                ]
            },
            ava: {
                author: "Ava Stone",
                initial: "A",
                avatarClass: "avatar-ava",
                time: "Mon 18:33",
                title: "Foam rolling after hills helped",
                body: "Did 6 short hill repeats, then rolled calves for 8 minutes. Legs felt much lighter on tomorrow's shakeout.\n\nThe biggest change was not rolling too hard. I kept it gentle, paused on tight spots, then finished with ankle circles and a slow walk home.",
                likes: "15 likes",
                comments: [
                    ["Mia Chen", "Gentle rolling is underrated. Hard pressure always makes me sore.", "18:50"],
                    ["Leo Park", "Adding ankle circles to my routine now.", "19:12"],
                    ["Sofia Liu", "Hill days scare me, but this recovery plan sounds manageable.", "19:27"]
                ]
            },
            noah: {
                author: "Noah Kim",
                initial: "N",
                avatarClass: "avatar-noah",
                time: "Sun 09:16",
                title: "Half marathon negative split goal",
                body: "Starting 10 sec/km slower than goal pace, then picking it up after 12K. Anyone else trying this strategy?\n\nI wrote the target splits on my wrist because I always get pulled by the crowd. The plan is boring early, brave late: breathe easy, keep cadence smooth, and race after the final turn.",
                likes: "31 likes",
                comments: [
                    ["Ava Stone", "Boring early, brave late is such a good phrase.", "09:44"],
                    ["Leo Park", "Wrist splits saved my last race. Do it!", "10:08"],
                    ["Mia Chen", "I am trying this for my next 10K too.", "10:19"]
                ]
            },
            sofia: {
                author: "Sofia Liu",
                initial: "S",
                avatarClass: "avatar-sofia",
                time: "Sat 17:55",
                title: "Small win: first 30-minute run",
                body: "Used run-walk intervals and focused on breathing. If you're new too, slowing down really works.\n\nI did 4 minutes running, 1 minute walking, repeated six times. It felt less scary than trying to run nonstop, and I still finished feeling proud instead of exhausted.",
                likes: "42 likes",
                comments: [
                    ["Mia Chen", "That is a huge win. Keep stacking these!", "18:03"],
                    ["Ava Stone", "Run-walk is real training. Congrats!", "18:16"],
                    ["Noah Kim", "Proud finish beats exhausted finish every time.", "18:40"]
                ]
            },
            susan: {
                author: "Susan Li",
                initial: "S",
                avatarClass: "avatar-susan",
                time: "Sun 17:55",
                title: "Big achievement: keep running for 100 days",
                body: "I can't believe I have keep runnging for 100 days. I will tell everyone this news!",
                likes: "56 likes",
                comments: [
                    ["Mia Chen", "That is a huge win. Keep stacking these!", "18:03"],
                    ["Ava Stone", "Congrats!", "18:16"],
                    ["Noah Kim", "Proud finish beats exhausted finish every time.", "18:40"]
                ]
            }
        };

        function getUserPost(postKey) {
            if (!postKey || !postKey.startsWith("user_")) {
                return null;
            }

            const postId = postKey.slice(5);
            let userPosts = [];
            try {
                const storedPosts = JSON.parse(localStorage.getItem("runbuddy_posts") || "[]");
                userPosts = Array.isArray(storedPosts) ? storedPosts : [];
            } catch (error) {
                userPosts = [];
            }

            const matchedPost = userPosts.find((item) => String(item.id) === postId);
            if (!matchedPost) {
                return null;
            }

            const title = (matchedPost.title || "My Post").trim();
            const body = (matchedPost.content || matchedPost.text || "").trim();
            let displayTime = "Just now";
            if (matchedPost.timestamp) {
                const date = new Date(matchedPost.timestamp);
                if (!Number.isNaN(date.getTime())) {
                    displayTime = date.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                }
            }

            return {
                author: "You",
                initial: "Y",
                avatarClass: "avatar-sofia",
                time: displayTime,
                title,
                body: body || "No content.",
                likes: "0 likes",
                comments: []
            };
        }

        const params = new URLSearchParams(window.location.search);
        const postKey = params.get("post");
        const post = getUserPost(postKey) || posts[postKey] || posts.mia;
        const avatar = document.getElementById("postAvatar");

        avatar.textContent = post.initial;
        avatar.className = `avatar ${post.avatarClass}`;
        document.getElementById("postAuthor").textContent = post.author;
        document.getElementById("postTime").textContent = post.time;
        document.getElementById("postTitle").textContent = post.title;
        document.getElementById("postBody").textContent = post.body;
        document.getElementById("likeCount").textContent = post.likes;
        document.getElementById("commentCount").textContent = `${post.comments.length} comments`;

        const commentsHtml = post.comments.length === 0
            ? `
            <article class="comment">
                <p class="comment-text">No comments yet.</p>
            </article>
            `
            : post.comments.map(([name, text, time]) => `
            <article class="comment">
                <div class="comment-row">
                    <div class="avatar" aria-hidden="true">${name.charAt(0)}</div>
                    <div class="comment-main">
                        <div class="comment-name">${name}</div>
                        <div class="comment-time">${time}</div>
                    </div>
                </div>
                <p class="comment-text">${text}</p>
            </article>
        `).join("");

        document.getElementById("comments").innerHTML = commentsHtml;

        if (window.location.hash === "#comments") {
            document.getElementById("comments").scrollIntoView({ behavior: "smooth", block: "start" });
        }
