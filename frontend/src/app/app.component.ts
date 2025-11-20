import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from './services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private notificationSubscription?: Subscription;

  constructor(
    private socketService: SocketService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.notificationSubscription = this.socketService.onNotification().subscribe((data) => {
      this.toastr.info(data.message, 'Notification');
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
