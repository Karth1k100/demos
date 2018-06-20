
import * as React from 'react';
import * as awsCognito from 'amazon-cognito-identity-js';

export class SignInComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    console.log(props);
  }

  public updateUsername = (e: any) => {
    const username = e.target.value;
    this.props.updateUsername(username);
  }

  public updatePassword = (e: any) => {
    const password = e.target.value;
    this.props.updatePassword(password);
  }
  public updateConfirmationPassword = (e: any) => {
    const password = e.target.value;
    this.props.updateConfirmationPassword(password);
  }
  public updateNewPassword = (e: any) => {
    const password = e.target.value;
    this.props.updateNewPassword(password);
  }

  public onSuccess = (result: awsCognito.CognitoUserSession) => {
    const token = result.getIdToken().getJwtToken();
    localStorage.setItem('token', token);
    // console.log(userPool.getCurrentUser());
    // console.log(result.getIdToken().decodePayload())
    // const idtok: any = result.getIdToken();
    // console.log(idtok.payload['cognito:groups']) //payload has the user info on it

    // navigate pages now that we have successfully logged in
    this.props.history.push('/movies');
    this.props.resetState();
  }

  public onFailure = (err: any) => {
    console.log(err);
    if (err.code === 'UserNotFoundException' || err.code === 'NotAuthorizedException') {
      this.props.updateError('Invalid Credentials, try again.');
    } else if (err.code === 'PasswordResetRequiredException') {
      this.props.resetPassword(this.props.password);
    } else {
      this.props.updateError('Unable to login at this time, please try again later');
    }
  }

  public submit = (e: any) => {
    e.preventDefault();
    const { username, password } = this.props; // destructuring
    const credentials = { username, password };

    const authenticationData = {
      Password: credentials.password,
      Username: credentials.username,
    };
    const authenticationDetails = new awsCognito.AuthenticationDetails(authenticationData);
    const poolData = {
      ClientId: 'btajb4q70ikvmhb12jo6oo03e', // Your client id here
      UserPoolId: 'us-west-2_rwVFefjCF', // Your user pool id here
    };
    const userPool = new awsCognito.CognitoUserPool(poolData);
    const userData = {
      Pool: userPool,
      Username: credentials.username,
    };
    const cognitoUser = new awsCognito.CognitoUser(userData);
    this.props.updateCognitoUser(cognitoUser);
    cognitoUser.authenticateUser(authenticationDetails, {
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        this.props.setFirstSignin(true);
      },
      onFailure: this.onFailure,
      onSuccess: this.onSuccess,


    });
  }

  public submitNewPassword = (e: any) => {
    e.preventDefault();
    alert(this.props.firstSignIn.code)
    const { password, passwordConfirmation } = this.props.firstSignIn;
    if (password !== passwordConfirmation) {
      alert('passwords do not match');
      return;
    }
    if (this.props.firstSignIn.code) {
     
      const user: awsCognito.CognitoUser = this.props.cognito.user;
      user.confirmPassword(this.props.firstSignIn.code, password, {
        onFailure: (error: Error) => {
          console.log(error)
          alert('invalid code');
          this.props.resetState();
        },
        onSuccess: () => {
          this.props.resetState();
        }
      });
      return;
    } else {
      const user: awsCognito.CognitoUser = this.props.cognito.user;
      user.getUserAttributes((attributes) => {
        user.completeNewPasswordChallenge(password, attributes, {
          onFailure: this.onFailure,
          onSuccess: this.onSuccess,
        })
      })

    }
  }

  public render() {
    return (
      <div>
        {!this.props.firstSignIn.isFirstSignIn &&
          <form className="form-signin" onSubmit={this.submit}>
            <img className="mb-4" src="https://getbootstrap.com/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
            <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
            <label htmlFor="inputUsername" className="sr-only">Username</label>
            <input value={this.props.username}
              onChange={this.updateUsername}
              type="text" id="inputUsername"
              className="form-control"
              placeholder="Username"
              required />
            <label htmlFor="inputPassword" className="sr-only">Password</label>
            <input value={this.props.password}
              onChange={this.updatePassword}
              type="password"
              id="inputPassword"
              className="form-control"
              placeholder="Password"
              required />
            {this.props.errorMessage !== '' &&
              <div id="error-message">
                {this.props.errorMessage}
              </div>
            }
            <div className="checkbox mb-3">
              <label>
                <input type="checkbox" value="remember-me" /> Remember me
          </label>
            </div>
            <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
            <p className="mt-5 mb-3 text-muted">&copy; 2017-2018</p>
          </form>
        }
        {this.props.firstSignIn.isFirstSignIn &&
          <form className="form-signin" onSubmit={this.submitNewPassword}>
            <h1 className="h3 mb-3 font-weight-normal">Choose a new password.</h1>
            <label htmlFor="inputNewPassword" className="sr-only">New Password</label>
            <input value={this.props.firstSignIn.password}
              onChange={this.updateNewPassword}
              type="password" id="inputNewPassword"
              className="form-control"
              placeholder="New Password"
              required />
            <label htmlFor="inputConfimPassword" className="sr-only">Confirm Password</label>
            <input value={this.props.firstSignIn.confirmationPassword}
              onChange={this.updateConfirmationPassword}
              type="password"
              id="inputConfirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              required />
            <button className="btn btn-lg btn-primary btn-block" type="submit">Update</button>
          </form>
        }

      </div>
    );
  }
}