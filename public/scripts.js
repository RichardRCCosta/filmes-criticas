// Função para obter o ID do filme da URL
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Simulação de dados dos filmes
const movieData = {
    1: { title: "Movie 1", image: "movie1.jpg" },
    2: { title: "Movie 2", image: "movie2.jpg" },
    3: { title: "Movie 3", image: "movie3.jpg" }
};

// Inicialização da página de detalhes do filme
if (window.location.pathname.includes('movie.html')) {
    const movieId = getMovieIdFromUrl();
    const movie = movieData[movieId];

    if (movie) {
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-image').src = movie.image;
        loadComments(movieId);
    }

    // Gerar estrelas para avaliação
    const starRating = document.getElementById('star-rating');
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.innerHTML = '★';
        star.dataset.rating = i;

        // Removendo evento de 'mouseover'
        star.addEventListener('click', () => {
            document.querySelectorAll('#star-rating span').forEach(s => {
                s.style.color = parseInt(s.dataset.rating) <= i ? 'gold' : '#ddd';
                s.classList.remove('selected');
            });
            star.classList.add('selected');
        });

        starRating.appendChild(star);
    }

    // Adicionar evento ao formulário de comentários
    document.getElementById('review-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const rating = document.querySelector('#star-rating span.selected')?.dataset.rating || 0;
        const comment = document.getElementById('review-comment').value;
        if (comment) {
            addComment(movieId, rating, comment);
            document.getElementById('review-form').reset();
            document.querySelectorAll('#star-rating span').forEach(s => {
                s.style.color = '#ddd';
                s.classList.remove('selected');
            });
        }
    });
}

function loadComments(movieId) {
    fetch(`/api/comments/${movieId}`)
        .then(response => response.json())
        .then(data => {
            const commentsList = document.getElementById('comments-list');
            commentsList.innerHTML = '';
            data.comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');

                const commentText = document.createElement('p');
                commentText.textContent = comment.comment;

                const commentRating = document.createElement('p');
                commentRating.textContent = `Rating: ${comment.rating}/5`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-comment');
                deleteButton.addEventListener('click', () => {
                    deleteComment(comment.id, commentDiv);
                });

                commentDiv.appendChild(commentText);
                commentDiv.appendChild(commentRating);
                commentDiv.appendChild(deleteButton);

                commentsList.appendChild(commentDiv);
            });
        });
}

function addComment(movieId, rating, text) {
    fetch('/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieId, rating, comment: text })
    })
    .then(response => response.json())
    .then(data => {
        loadComments(movieId);
    });
}

function deleteComment(commentId, commentDiv) {
    fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.deleted) {
            commentDiv.remove();
        }
    });
}
