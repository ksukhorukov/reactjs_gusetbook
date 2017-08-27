class CommentForm extends React.Component {
  render() {
    return (
      <form className="comment-form" onSubmit={this._handleSubmit.bind(this)}>
        <label>Join the discussion</label>
        <div className="comment-form-fields">
          <input placeholder="Name:" ref={(input) => this._author = input} />
          <textarea placeholder="Comment:" ref={(textarea) => this._body = textarea} >
          </textarea>
        </div>
        <div className="comment-form-actions">
          <button type="submit">
            Post comment 
          </button>
        </div>
      </form>
    );
  }

  _handleSubmit(event) {
    event.preventDefault();

    let author = this._author;
    let body = this._body;

    this.props.addComment(author.value, body.value);
  }
}

class Comment extends React.Component {
  render() {
    return(
      <div className="comments">
        <p className="comment-header">{this.props.author}</p>
        <p className="comment-body">
          {this.props.body}
        </p>
        <div className="comment-footer">
          <a href="#" className="comment-footer-delete" onClick={this._handleDelete.bind(this)}>
            Delete comment
          </a>
        </div>
      </div>
    );
  }

  _handleDelete(event) {
    event.preventDefault();
    if (confirm('Are you sure?')) {
      this.props.onDelete(this.props.comment);  
    }
  }
}

class CommentBox extends React.Component {

  constructor() {
    super();

    
    this.state = {
      showComments: false,
      comments: []
    };
  }

  _getCommentsTitle(commentCount) {
    if (commentCount === 0) {
      return 'No comments yet...';
    } else if (commentCount === 1) {
      return '1 comment'
    } else {
      return `${commentCount} comments`;
    }
  }

  _getComments() {
    return this.state.comments.map((comment) => {
      return (
        <Comment 
          author={comment.author} 
          body={comment.body} 
          key={comment.id}
          onDelete={this._deleteComment.bind(this)} />
      );
    });
  }

  _handleClick() {
    this.setState({
      showComments: !this.state.showComments
    });
  }

  _addComment(author, body) {
    const comment = { author, body };

    jQuery.post('/api/comments', { comment })
      .success(newComment => {
        this.setState({ comments: this.state.comments.concat([newComment]) });
      });
  }
}

  _fetchComments() {
    jQuery.ajax({
      method: 'GET',
      url: '/api/comments',
      success: (comments) => {
        this.setState({ comments })
      }
    });
  }

  _deleteComment(comment) {

    jQuery.ajax({
      method: 'DELETE',
      url: `/api/comments/${comment.id}`
    });

    const comments = [...this.state.comments];
    const commentIndex = comments.indexOf(comment);
    comment.splice(commentIndex, 1);

    this.setState({ comments });
  }

  componentWillMount() {
    this._fetchComments();
  }

  componentDidMount() {
    this._timer = setInterval(() => this._fetchComments(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  render() {
    const comments = this._getComments();
    let commentNodes;
    let buttonText = 'Show comments';
    if (this.state.showComments) {
      buttonText = 'Hide comments';
      commentNodes = <div className="comments-list">{comments}</div>;
    }
    return(
      <div className="comment-box">
        <CommentForm addComment={this._addComment.bind(this)} />
        <h3>Comments</h3>
        <h4 className="comment-count">
          {this._getCommentsTitle(comments.length)}
        </h4>
        <button onClick={this._handleClick.bind(this)}>{buttonText}</button>
        {commentNodes}
      </div>
    );
  }
}

ReactDOM.render(
  <CommentBox />, document.getElementById('story-app')
);